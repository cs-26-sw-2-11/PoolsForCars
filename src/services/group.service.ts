import { getRoute, type DirectionsResponse, type Route } from "../openrouteservice.js";
import * as calendarDayModel from "../models/calendar_day.model.js";
import * as groupModel from "../models/group.model.js";
import * as costModel from "../models/cost.model.js";
import * as compatibilityModel from "../models/compatibility.model.js";
import * as userModel from "../models/user.model.js";

export type Group = groupModel.Group;

const ACCEPTED_DETOUR: number = 10 * 60;

export const makeNewGroup = async (userId: number, day: calendarDayModel.CalendarDay): Promise<Group> => {
    const routeToDest: DirectionsResponse = await getRoute(day.pickupPoint.coordinates, day.destination.coordinates);
    const firstRouteToDest: Route = routeToDest.routes[0] as Route;

    if (typeof firstRouteToDest === 'undefined') throw "No route found";

    const costToDestination: costModel.Cost = {
        travelTimeSeconds: firstRouteToDest.summary.duration,
        travelDistanceMeters: firstRouteToDest.summary.distance,
        distanceEuclidean: euclideanDistance(day.pickupPoint.coordinates, day.destination.coordinates),
    }

    const groupMember: groupModel.GroupMember = {
        userId: userId,
        coordinates: day.pickupPoint.coordinates,
        toNext: null,
        toDestination: costToDestination,
    }

    const group: groupModel.Group = {
        id: 0,
        members: [groupMember],
        route: [userId],
        totalTravelTimeSeconds: costToDestination.travelTimeSeconds as number,
        totalDetourTimeSeconds: 0,
        secsPerMeterAverage: Number(costToDestination.travelTimeSeconds) / Number(costToDestination.travelDistanceMeters),
        metersPerEuclideanDistAverage: Number(costToDestination.travelDistanceMeters) / costToDestination.distanceEuclidean,
    };


    const newGroup: groupModel.Group = await groupModel.createGroup(group);
    day.groups[0] = newGroup.id;

    return newGroup;
}


export const searchForGroups = async (userId: number, day: calendarDayModel.CalendarDay, compatibility: compatibilityModel.WeeklyCompatibilityIndex, weekNumber: number, dayString: string) => {
    for (let candidate of compatibility.sortedAccumulator ?? []) {
        // checks if the candidate is compatible with the user on this day
        if (!compatibility.weeks[weekNumber]?.[compatibilityModel.convertToDayname(dayString)][candidate.id]) continue;

        const candidateUser: userModel.User = await userModel.readUser(candidate.id);
        const candidateDay: calendarDayModel.CalendarDay = candidateUser.calendar[weekNumber]?.days[dayString] as calendarDayModel.CalendarDay;
        console.log("Candidate day:", JSON.stringify(candidateDay, null, 2));
        const group: groupModel.Group = await groupModel.readGroup(Number(candidateDay.groups[0]));
        await testGroup(userId, day, group);
    }
}


export const testGroup = async (userId: number, day: calendarDayModel.CalendarDay, group: groupModel.Group) => {
    // [[[userId, [LAN, LON]], distance]]
    const distsToDest: { id: number, distance: number }[] = group.members.map<{ id: number, distance: number }>(
        (member) => ({
            id: member.userId,
            distance: member.toDestination.distanceEuclidean
        }));
    distsToDest.push({ id: userId, distance: euclideanDistance(day.pickupPoint.coordinates, day.destination.coordinates) });

    distsToDest.sort((a, b) => b.distance - a.distance);

    let userIndex: number = 0;
    for (const item of distsToDest.entries()) {
        if (item[0] === userId) {
            userIndex = item[0];
            break;
        }
    }

    let previousUser: groupModel.GroupMember = group.members[0] as groupModel.GroupMember;

    let currentUser: groupModel.GroupMember = {
        userId: userId,
        coordinates: day.pickupPoint.coordinates,
        toNext: null,
        toDestination: {
            distanceEuclidean: distsToDest[userIndex]?.distance as number,
            travelTimeSeconds: null,
            travelDistanceMeters: null
        }
    };
    //
    // let nextUser: groupModel.GroupMember = group.members[0] as groupModel.GroupMember;
    // let previousNode: [number, number] = group.members[0]?.coordinates as [number, number];

    // let currentNode: [number, number] = day.pickupPoint.coordinates;

    let nextNode: [number, number] = day.destination.coordinates as [number, number];

    for (const member of group.members) {
        if (member.userId === distsToDest[userIndex - 1]?.id) {
            previousUser = member;
            continue;
        }
        if (member.userId === distsToDest[userIndex + 1]?.id) {
            nextNode = member.coordinates;
            continue;
        };
    }

    // const prevToCurrUserDist: number = euclideanDistance(previousUser.coordinates, currentUser.coordinates);
    // const currToNextUserDist: number = euclideanDistance(currentUser.coordinates, nextUser.coordinates);
    //
    // const prevToCurrUserTT: number = prevToCurrUserDist * group.metersPerEuclideanDistAverage * group.secsPerMeterAverage;
    // const currToNextUserTT: number = currToNextUserDist * group.metersPerEuclideanDistAverage * group.secsPerMeterAverage;
    //
    //
    // let totalTravelTime: number = group.totalTravelTimeSeconds;
    // totalTravelTime -= previousUser.toNext?.travelTimeSeconds ?? 0;

    const prevToCurrUserDist: number = euclideanDistance(previousUser.coordinates, currentUser.coordinates);
    const currToNextUserDist: number = euclideanDistance(currentUser.coordinates, nextNode);

    const prevToCurrUserTT: number = prevToCurrUserDist * group.metersPerEuclideanDistAverage * group.secsPerMeterAverage;
    const currToNextUserTT: number = currToNextUserDist * group.metersPerEuclideanDistAverage * group.secsPerMeterAverage;


    console.log(`Testing user ${userId} on day ${day.date} against group`, JSON.stringify(group, null, 2));
    console.log(distsToDest);
    console.log("previous:", previousUser, "current:", currentUser, "next:", nextNode, "dest:", day.destination);

    console.log("prevToCurrUserDist:", prevToCurrUserDist, "currToNextUserDist:", currToNextUserDist, "prevToCurrUserTT:", prevToCurrUserTT, "currToNextUserTT:", currToNextUserTT);



    const OGtotalTravelTime: number = group.totalTravelTimeSeconds;
    console.log("OG totalTravelTime:", OGtotalTravelTime);
    const trimmedTotalTravelTime = OGtotalTravelTime - (previousUser.toNext?.travelTimeSeconds ?? (previousUser.toDestination.travelTimeSeconds ?? 0));
    console.log("totalTravelTime - link:", trimmedTotalTravelTime);
    const newTotalTravelTime = trimmedTotalTravelTime + prevToCurrUserTT + currToNextUserTT;
    console.log("totalTravelTime + new links:", newTotalTravelTime);
    const driverToDestTT: number = group.members[0]?.toDestination.travelTimeSeconds ?? 0;
    console.log("driverToDestTT:", driverToDestTT);

    const totalDetour: number = newTotalTravelTime - driverToDestTT;
    if (totalDetour > ACCEPTED_DETOUR) {
        return;
    }

    const prevToCurrRoute = await getRoute(previousUser.coordinates, currentUser.coordinates);
    previousUser.toNext = {
        distanceEuclidean: prevToCurrUserDist,
        travelTimeSeconds: prevToCurrRoute.routes[0]?.summary.duration as number,
        travelDistanceMeters: prevToCurrRoute.routes[0]?.summary.distance as number,
    };

    if (day.destination.coordinates !== nextNode) {
        const currToNextRoute = await getRoute(currentUser.coordinates, nextNode);
        currentUser.toNext = {
            distanceEuclidean: currToNextUserDist,
            travelTimeSeconds: currToNextRoute.routes[0]?.summary.duration as number,
            travelDistanceMeters: currToNextRoute.routes[0]?.summary.distance as number,
        };
    } else {
        const currToDestRoute = await getRoute(currentUser.coordinates, nextNode);
        currentUser.toDestination = {
            distanceEuclidean: currToNextUserDist,
            travelTimeSeconds: currToDestRoute.routes[0]?.summary.duration as number,
            travelDistanceMeters: currToDestRoute.routes[0]?.summary.distance as number,
        };

    }

    group.members.push(currentUser);

    group.route = [];
    distsToDest.forEach(element => {
        group.route.push(element.id);
    });

    group.totalTravelTimeSeconds = newTotalTravelTime;
    group.totalDetourTimeSeconds = totalDetour;

    let totalDistanceTravel: number = 0;
    let totalDistanceEuclidiean: number = 0;
    group.members.forEach(member => {
        totalDistanceTravel += member.toNext?.travelDistanceMeters ?? (member.toDestination.travelDistanceMeters ?? 0);
        totalDistanceEuclidiean += member.toNext?.distanceEuclidean ?? (member.toDestination.distanceEuclidean ?? 0);
    });

    group.secsPerMeterAverage = group.totalTravelTimeSeconds / totalDistanceTravel;
    group.metersPerEuclideanDistAverage = totalDistanceTravel / totalDistanceEuclidiean;

    await groupModel.updateGroup(group.id, group);

    console.log("Detour is acceptable");
}



































const euclideanDistance = (vector1: [number, number], vector2: [number, number]): number => {
    return Math.sqrt(Math.pow((vector2[0] - vector1[0]), 2) + Math.pow((vector2[1] - vector1[1]), 2));
}
