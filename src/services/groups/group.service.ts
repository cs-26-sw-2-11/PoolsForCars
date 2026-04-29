import { getRoute, type DirectionsResponse, type Route } from "../../openrouteservice.js";
import * as calendarDayModel from "../../models/calendar_day.model.js";
import * as groupModel from "../../models/group.model.js";
import * as costModel from "../../models/cost.model.js";
import * as compatibilityModel from "../../models/compatibility.model.js";
import * as userModel from "../../models/user.model.js";
import * as notificationModel from "../../models/notification.model.js"
import { type AppendPassengerDTO } from "./dto/appendPassenger.dto.js"
import * as groupPlanner from "./group.planner.js";
import * as calenderModel from "../../models/calendar.model.js";
import { group } from "node:console";

export type GroupMember = groupModel.GroupMember;
export type Group = groupModel.Group;

const ACCEPTED_DETOUR: number = 10 * 60;



// ====== MAKE A NEW EMPTY GROUP ======
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
        totalCarSeats: day.seatsOffered + 1,
        members: [groupMember],
        destination: day.destination,
        route: [userId],
        totalTravelTimeSeconds: costToDestination.travelTimeSeconds as number,
        totalDetourTimeSeconds: 0,
        totalTravelDistanceMeters: costToDestination.travelDistanceMeters as number,
        totalTravelDistanceEuclidiean: costToDestination.distanceEuclidean,
        secsPerMeterAverage: Number(costToDestination.travelTimeSeconds) / Number(costToDestination.travelDistanceMeters),
        metersPerEuclideanDistAverage: Number(costToDestination.travelDistanceMeters) / costToDestination.distanceEuclidean,

    };


    const newGroup: groupModel.Group = await groupModel.createGroup(group);
    day.groups[0] = newGroup.id;

    return newGroup;
}


// ====== Given a user and a compatibility map, search for all groups ======
export const searchForGroups = async (user: userModel.User, compatibilityMap: compatibilityModel.WeeklyCompatibilityIndex) => {
    const todaysDate: Date = new Date();
    const todaysWeek: number = await calenderModel.dateToWeek(todaysDate);

    // Premake a list of potential matches (list of notifications to make)
    let potentialMatches: AppendPassengerDTO[] = [];

    // Loop over all weeks in the users calender
    for (const week of Object.entries(user.calendar)) {
        if (Number(week[0]) < todaysWeek) continue; // Skip current iteration if week is in the past

        // Loop over all days in the week
        for (const day of Object.entries(week[1].days)) {
            if (day[1].date.getDay() < todaysDate.getDay()) continue; // Skip current iteration if the day is in the past


            // Loop over all temporally compatible users from most to least overall compatible
            for (let candidate of compatibilityMap.sortedAccumulator ?? []) {
                // Skip candidate if they and is not compatible on this exact day
                if (!compatibilityMap.weeks[Number(week[0])]?.[compatibilityModel.convertToDayname(day[0])][candidate.id]) continue;

                // Fetch user and day objects for candidate
                const candidateUser: userModel.User = await userModel.readUser(candidate.id);
                const candidateDay: calendarDayModel.CalendarDay = candidateUser.calendar[Number(week[0])]?.days[day[0]] as calendarDayModel.CalendarDay;
                console.log(`Candidate ${candidateUser.id}'s day:`, JSON.stringify(candidateDay, null, 2));

                // Fetch the correct group depending on whos the driver
                const group: groupModel.Group = await groupModel.readGroup(
                    Number(
                        candidateDay.carAvailability
                            ? candidateDay.groups[0]
                            : day[1].groups[0]
                    )
                );
                console.log("Testing group:", JSON.stringify(group, null, 2));

                // Skip if all seats in the car are already filled
                if (group.members.length === group.totalCarSeats) continue;

                // Test candidate in group
                const testResponse: { valid: boolean, reason: string, dto: AppendPassengerDTO | null } = await testGroup(candidateUser.id, candidateDay, group);
                console.log(testResponse);

                // Push the test response (notification) to potential-matches if its valid
                if (testResponse.valid && testResponse.dto !== null) potentialMatches.push(testResponse.dto);
            }
        }
    }

    for (const dto of potentialMatches) {
        console.log(JSON.stringify(dto, null, 2));
        const notification: notificationModel.Notification = await notificationModel.createNotification(dto);
        console.log(JSON.stringify(notification, null, 2));
    }
}


export const testGroup = async (userId: number, day: calendarDayModel.CalendarDay, group: groupModel.Group) => {
    // Contruct array of user ids and distance to destination
    // Append user to this array and sort it
    const distsToDest: { id: number, distance: number }[] = group.members.map<{ id: number, distance: number }>(
        (member) => ({
            id: member.userId,
            distance: member.toDestination.distanceEuclidean
        }));
    distsToDest.push({ id: userId, distance: euclideanDistance(day.pickupPoint.coordinates, day.destination.coordinates) });

    distsToDest.sort((a, b) => b.distance - a.distance);
    // --------------------------

    console.log("Dists To Dest:", distsToDest);

    // If candidate is longer from destination than the driver
    if (distsToDest[0]?.id !== group.members[0]?.userId) {
        return { valid: false, reason: "too far from driver", dto: null };
    }
    // --------------------------

    // Find the current users index in the sorted array
    const userIndex: number = distsToDest.findIndex(x => x.id === userId);
    console.log("User Index", userIndex);

    const previousMember: groupModel.GroupMember = group.members.find(x => x.userId === distsToDest[userIndex - 1]?.id) as groupModel.GroupMember;
    console.log("Previous member", previousMember);

    const candidateMember: groupModel.GroupMember = {
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
    // let nextNode: [number, number] = day.destination.coordinates as [number, number];
    const nextNode: groupModel.GroupMember | null = previousMember.toNext ? group.members.find(x => x.userId === userIndex + 1) as groupModel.GroupMember : null;
    const nextCoords: [number, number] = nextNode ? nextNode.coordinates : group.destination.coordinates;

    const prevToCurrUserDist: number = euclideanDistance(previousMember.coordinates, candidateMember.coordinates);
    const currToNextUserDist: number = euclideanDistance(candidateMember.coordinates, nextCoords);

    const prevToCurrUserTT: number = prevToCurrUserDist * group.metersPerEuclideanDistAverage * group.secsPerMeterAverage;
    const currToNextUserTT: number = currToNextUserDist * group.metersPerEuclideanDistAverage * group.secsPerMeterAverage;


    console.log(`Testing user ${userId} on day ${day.date} against group`, JSON.stringify(group, null, 2));
    console.log(distsToDest);
    console.log("previous:", previousMember, "current:", candidateMember, "next:", nextNode ? nextNode : nextCoords, "dest:", group.destination);

    console.log("prevToCurrUserDist:", prevToCurrUserDist, "currToNextUserDist:", currToNextUserDist, "prevToCurrUserTT:", prevToCurrUserTT, "currToNextUserTT:", currToNextUserTT);



    const OGtotalTravelTime: number = group.totalTravelTimeSeconds;
    console.log("OG totalTravelTime:", OGtotalTravelTime);

    const trimmedTotalTravelTime = OGtotalTravelTime - (previousMember.toNext?.travelTimeSeconds ?? (previousMember.toDestination.travelTimeSeconds ?? 0));
    console.log("totalTravelTime - link:", trimmedTotalTravelTime);

    const newTotalTravelTime = trimmedTotalTravelTime + prevToCurrUserTT + currToNextUserTT;
    console.log("totalTravelTime + new links:", newTotalTravelTime);

    const driverToDestTT: number = group.members[0]?.toDestination.travelTimeSeconds ?? 0;
    console.log("driverToDestTT:", driverToDestTT);

    const totalDetour: number = newTotalTravelTime - driverToDestTT;
    if (totalDetour > ACCEPTED_DETOUR) {
        return { valid: false, reason: "detour too large", dto: null };
    }

    return {
        valid: true,
        reason: "detour is acceptable",
        dto: await groupPlanner.buildAppendPassengerDTO(
            group,
            previousMember,
            candidateMember,
            nextNode,
            nextCoords,
            userIndex - 1,
            userIndex + 1,
            prevToCurrUserDist,
            currToNextUserDist,
            totalDetour,
            newTotalTravelTime,
            distsToDest.map(x => x.id)
        )
    };



    // console.log("Detour is acceptable");
    // console.log("Google maps link:");
    // console.log(`https://www.google.com/maps/dir/?api=1&origin=${group.members[0]?.coordinates[0]}%2C${group.members[0]?.coordinates[1]}&destination=${day.destination?.coordinates[0]}%2C${day.destination?.coordinates[1]}&travelmode=driving&waypoints=${currentUser.coordinates[0]}%2C${currentUser.coordinates[1]}`);


}


export const testPassenger = async () => {

}


export const appendPassengerToGroup = async (dto: AppendPassengerDTO) => {
    const group = await groupModel.readGroup(dto.groupId);

    const previousMember: groupModel.GroupMember = group.members[dto.previousIndex] as groupModel.GroupMember;

    const candidateMember: groupModel.GroupMember = {
        userId: dto.candidateMember.userId,
        coordinates: dto.candidateMember.coordinates,
        toNext: dto.isNextDestination ? null : dto.candToNext,
        toDestination: dto.candToDest,
    }

    previousMember.toNext = dto.prevToCand;

    group.members.push(candidateMember);

    group.route = dto.routeOrder;

    group.totalTravelTimeSeconds = dto.newTotalTravelTime;
    group.totalDetourTimeSeconds = dto.totalDetour;
    group.secsPerMeterAverage = dto.secsPerMeterAverage;
    group.metersPerEuclideanDistAverage = dto.metersPerEuclideanDistAverage;

    await groupModel.updateGroup(group.id, group);
}

const euclideanDistance = (vector1: [number, number], vector2: [number, number]): number => {
    return Math.sqrt(Math.pow((vector2[0] - vector1[0]), 2) + Math.pow((vector2[1] - vector1[1]), 2));
}
