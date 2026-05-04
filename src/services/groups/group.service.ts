import { getRoute, type DirectionsResponse, type Route, type RouteSummary } from "../ors.service.js";
import * as calendarDayModel from "../../models/calendar_day.model.js";
import * as groupModel from "../../models/group.model.js";
import * as costModel from "../../models/cost.model.js";
import * as compatibilityModel from "../../models/compatibility.model.js";
import * as userModel from "../../models/user.model.js";
import * as groupExecutor from "./group.executor.js";

export type GroupMember = groupModel.GroupMember;
export type Group = groupModel.Group;


interface CandidatePair {
    day: string;
    week: number;
    driver: userModel.User | number;
    passenger: userModel.User | number;
    driverDay: calendarDayModel.CalendarDay | null;
    passengerDay: calendarDayModel.CalendarDay | null;
}

type Coord = [number, number];

export interface Candidate {
    userId: number;
    coordinates: Coord;
    destination: Coord;
}

export interface InsertionPlan {
    insertionCandidate: Candidate;

    previousUserId: number;
    currentUserId: number;
    nextUserId: number | null;
    routeOrder: number[];

    prevToCurrDistance: number;
    currToNextDistance: number;

    newTotalTravelTime: number;
    estimatedAddedDetour: number;
    totalDetour: number;

    mapsLink: string;
}

const ACCEPTED_DETOUR: number = 10 * 60;


export const getGroup = async (id: number): Promise<groupModel.Group> => {
    return await groupModel.readGroup(id);
}

export const getAllUserGroupsAsDriver = async (userId: number): Promise<groupModel.Group[]> => {
    const user: userModel.User = await userModel.readUser(userId);
    const groups: groupModel.Group[] = await Promise.all(
        user.driverInGroups.map(groupId => groupModel.readGroup(groupId))
    );
    return groups;
}

const buildNewGroup = (
    userId: number,
    day: calendarDayModel.CalendarDay,
    costToDestination: costModel.Cost,
    dayString: string,
    weekNumber: number,
): groupModel.Group => {

    const member: groupModel.GroupMember = {
        userId: userId,
        coordinates: day.pickupPoint.coordinates,
        toNext: null,
        toDestination: costToDestination,
    }

    const group: groupModel.Group = {
        id: 0, // placeholder
        day: dayString,
        week: weekNumber,
        seatsOffered: day.seatsOffered,
        members: [member],
        pendingMembers: {},
        destination: day.destination,
        route: [userId],
        totalTravelTimeSeconds: costToDestination.travelTimeSeconds as number,
        totalDetourTimeSeconds: 0,
        totalTravelDistanceMeters: costToDestination.travelDistanceMeters as number,
        totalTravelDistanceEuclidiean: costToDestination.distanceEuclidean,
        metersPerEuclideanDistAverage:
            Number(costToDestination.travelDistanceMeters) /
            costToDestination.distanceEuclidean,
        secsPerMeterAverage:
            Number(costToDestination.travelTimeSeconds) /
            Number(costToDestination.travelDistanceMeters),
        mapsLink: "",
    };

    return group;
}

const makeNewGroup = async (
    userId: number,
    day: calendarDayModel.CalendarDay,
    dayString: string,
    weekNumber: number,
) => {

    const routeToDestination: DirectionsResponse = await getRoute(
        day.pickupPoint.coordinates,
        day.destination.coordinates
    );

    const summary: RouteSummary = routeToDestination.routes[0]?.summary as RouteSummary;
    if (!summary) throw new Error("No route");

    const costToDestination: costModel.Cost = {
        travelTimeSeconds: summary.duration,
        travelDistanceMeters: summary.distance,
        distanceEuclidean: euclideanDistance(
            day.pickupPoint.coordinates,
            day.destination.coordinates
        ),
    };

    const group: groupModel.Group = buildNewGroup(
        userId,
        day,
        costToDestination,
        dayString,
        weekNumber,
    );

    const saved: groupModel.Group = await groupModel.createGroup(group);

    return saved;
}

export const makeNewGroups = async (user: userModel.User): Promise<number[]> => {

    const userDriverGroups: number[] = []

    for (const [weekNum, week] of Object.entries(user.calendar)) {

        for (const [dayKey, day] of Object.entries(week.days)) {

            if (!(day.carpoolingIntent && day.carAvailability)) continue;

            const group: Group = await makeNewGroup(user.id, day, dayKey, Number(weekNum));

            userDriverGroups.push(group.id);
        }
    }

    return userDriverGroups;
}

export const findCandidatePairs = (
    user: userModel.User,
    compatibilityMap: compatibilityModel.WeeklyCompatibilityIndex,
): CandidatePair[] => {
    const pairs: CandidatePair[][] = [];

    for (const [weekNum, week] of Object.entries(user.calendar)) {
        for (const dayKey in week.days) {
            pairs.push(findCompatibleCandidatePairs(user, compatibilityMap, Number(weekNum), dayKey));
        }
    }

    return pairs.flat();
}

export const findCompatibleCandidatePairs = (
    user: userModel.User,
    compatibilityMap: compatibilityModel.WeeklyCompatibilityIndex,
    weekNum: number,
    dayKey: string,
): CandidatePair[] => {

    const day: calendarDayModel.CalendarDay = user.calendar[weekNum]?.days[dayKey] as calendarDayModel.CalendarDay;

    const pairs: CandidatePair[] = [];

    for (const match of compatibilityMap.sortedAccumulator ?? []) {

        if (!compatibilityMap.weeks[Number(weekNum)]?.[
            compatibilityModel.convertToDayname(dayKey)
        ][match.id]) continue;


        pairs.push({
            day: dayKey,
            week: weekNum,
            driver: day.carAvailability ? user : match.id,
            passenger: day.carAvailability ? match.id : user,
            driverDay: day.carAvailability ? day : null,
            passengerDay: day.carAvailability ? null : day,
        });
    }

    return pairs;
}

export const searchForGroups = async (
    user: userModel.User,
    compatibilityMap: compatibilityModel.WeeklyCompatibilityIndex,
) => {

    const pairs: CandidatePair[] = findCandidatePairs(user, compatibilityMap);

    for (const pair of pairs) {

        if (typeof pair.driver !== "object" && pair.driver !== null) {
            pair.driver = await userModel.readUser(pair.driver);
        }
        if (!pair.driver) throw new Error("Could not read candidate driver");


        if (typeof pair.passenger !== "object" && pair.passenger !== null) {
            pair.passenger = await userModel.readUser(pair.passenger);
        }
        if (!pair.passenger) throw new Error("Could not read candidate passenger");


        pair.driverDay = pair.driver.calendar[pair.week]?.days[pair.day] as calendarDayModel.CalendarDay;
        if (!pair.driverDay) throw new Error("Could not read candidate drivers calendar day");
        pair.passengerDay = pair.passenger.calendar[pair.week]?.days[pair.day] as calendarDayModel.CalendarDay;
        if (!pair.passengerDay) throw new Error("Could not read candidate passengers calendarday");


        const group: groupModel.Group = await groupModel.readGroup(Number(pair.driverDay.groups[0]));

        if (group.members.length >= group.seatsOffered + 1) continue;

        const plan: InsertionPlan | null = planInsertion(
            group,
            {
                userId: pair.passenger.id,
                coordinates: pair.passengerDay.pickupPoint.coordinates,
                destination: group.destination.coordinates,
            },
            ACCEPTED_DETOUR
        );

        if (!plan) continue;


        group.pendingMembers[pair.passenger.id] = plan;

        await groupModel.updateGroup(group.id, group);


        pair.passengerDay.pendingGroups.push(group.id);

        await userModel.updateUser(pair.passenger.id, pair.passenger);
    }
}


export const planInsertion = (
    group: groupModel.Group,
    candidate: Candidate,
    ACCEPTED_DETOUR: number
): InsertionPlan | null => {

    // Contruct array of user ids and distance to destination
    // Append user to this array and sort it
    const distsToDest: { id: number, distance: number }[] = group.members.map(member => ({
        id: member.userId,
        distance: member.toDestination.distanceEuclidean
    }));

    const candidateDistanceToDestination: number = euclideanDistance(
        candidate.coordinates,
        candidate.destination
    );

    distsToDest.push({ id: candidate.userId, distance: candidateDistanceToDestination });

    // descending: farthest first
    distsToDest.sort((a, b) => b.distance - a.distance);

    // --------------------------

    console.log("Dists To Dest:", distsToDest);

    const driverId = group.members[0]?.userId;
    // If candidate is longer from destination than the driver
    if (distsToDest[0]?.id !== driverId) {
        return null;
    }


    // Find the current users index in the sorted array
    const candidateIndex: number = distsToDest.findIndex(x => x.id === candidate.userId);
    console.log("User Index", candidateIndex);

    // Early returns
    if (candidateIndex === -1) return null;
    if (candidateIndex === 0) return null;

    const previousId: number | null = distsToDest[candidateIndex - 1]?.id ?? null;
    const nextId: number | null = distsToDest[candidateIndex + 1]?.id ?? null;

    if (previousId === null) return null;

    const previousMember = group.members.find(member => member.userId === previousId);
    if (!previousMember) return null;
    console.log("Previous member", previousMember);

    const nextMember = nextId
        ? group.members.find(members => members.userId === nextId)
        : null;

    const nextCoords: Coord = nextMember
        ? nextMember.coordinates
        : group.destination.coordinates;


    const prevToCurrDistance: number = euclideanDistance(
        previousMember.coordinates,
        candidate.coordinates
    );

    const currToNextDistance: number = euclideanDistance(
        candidate.coordinates,
        nextCoords
    );


    const prevToCurrTT: number =
        prevToCurrDistance * 
        group.metersPerEuclideanDistAverage *
        group.secsPerMeterAverage;

    const currToNextTT: number =
        currToNextDistance *
        group.metersPerEuclideanDistAverage *
        group.secsPerMeterAverage;


    console.log(`Testing user ${candidate.userId} against group`, JSON.stringify(group, null, 2));
    console.log(distsToDest);
    console.log("previous:", previousMember, "current:", candidate, "next:", nextMember ? nextMember : nextCoords, "dest:", group.destination);

    console.log("prevToCurrUserDist:", prevToCurrDistance, "currToNextUserDist:", currToNextDistance, "prevToCurrUserTT:", prevToCurrTT, "currToNextUserTT:", currToNextTT);



    let removedTime: number;
    if (previousMember.toNext) {
        removedTime = previousMember.toNext.travelTimeSeconds ?? 0;
    } else {
        removedTime = previousMember.toDestination.travelTimeSeconds ?? 0;
    }

    console.log("OG totalTravelTime:", group.totalTravelTimeSeconds);

    const trimmedTotal: number = group.totalTravelTimeSeconds - removedTime;
    console.log("totalTravelTime - link:", trimmedTotal);

    const newTotalTravelTime: number = trimmedTotal + prevToCurrTT + currToNextTT;
    console.log("totalTravelTime + new links:", newTotalTravelTime);

    const driverToDestTT: number = group.members[0]?.toDestination.travelTimeSeconds ?? 0;
    console.log("driverToDestTT:", driverToDestTT);

    const totalDetour: number = newTotalTravelTime - driverToDestTT;

    if (totalDetour > ACCEPTED_DETOUR) {
        return null;
    }

    const routeOrder: number[] = distsToDest.map(x => x.id);

    // console.log("Detour is acceptable");
    // console.log("Google maps link:");
    // console.log(`https://www.google.com/maps/dir/?api=1&origin=${group.members[0]?.coordinates[0]}%2C${group.members[0]?.coordinates[1]}&destination=${day.destination?.coordinates[0]}%2C${day.destination?.coordinates[1]}&travelmode=driving&waypoints=${currentUser.coordinates[0]}%2C${currentUser.coordinates[1]}`);
    return {
        previousUserId: previousId,
        nextUserId: nextId,
        routeOrder: routeOrder,
        prevToCurrDistance: prevToCurrDistance,
        currToNextDistance: currToNextDistance,
        newTotalTravelTime: newTotalTravelTime,
        totalDetour: totalDetour
    } as InsertionPlan;
};


export const appendPassengerToGroup = async (dto: AppendPassengerDTO) => {
    const group = await groupModel.readGroup(dto.groupId);

    const previousMember: groupModel.GroupMember = group.members.find(member => member.userId === dto.previousIndex) as groupModel.GroupMember;

    const candidateMember: groupModel.GroupMember = {
        userId: dto.candidateMember.userId,
        coordinates: dto.candidateMember.coordinates,
        toNext: dto.isNextDestination ? null : dto.candToNext,
        toDestination: dto.candToDest,
    };

    const candidateUser: userModel.User = await userModel.readUser(candidateMember.userId);

    previousMember.toNext = dto.prevToCand;

    group.members.push(candidateMember);

    group.route = dto.routeOrder;

    group.totalTravelTimeSeconds = dto.newTotalTravelTime;
    group.totalDetourTimeSeconds = dto.totalDetour;
    group.secsPerMeterAverage = dto.secsPerMeterAverage;
    group.metersPerEuclideanDistAverage = dto.metersPerEuclideanDistAverage;

    if (group.members.length === group.seatsOffered + 1) {
        group.pendingMembers = {};
    } else {
        delete group.pendingMembers[candidateMember.userId];
    }

    candidateUser.groups.push(group.id);
    candidateUser.pendingGroups.splice(candidateUser.pendingGroups.findIndex(x => x === group.id), 1);

    await groupModel.updateGroup(group.id, group);
    await userModel.updateUser(candidateUser.id, candidateUser);

    await refreshPendingMembers(group);
}

const refreshPendingMembers = async (group: groupModel.Group) => {
    for (const pendingMember of Object.entries(group.pendingMembers)) {
        const pendingMemberUser: userModel.User = await userModel.readUser(Number(pendingMember[0]));
        const pendingMemberDay: calendarDayModel.CalendarDay = pendingMemberUser.calendar[group.week]?.days[group.day] as calendarDayModel.CalendarDay;
        await testGroup(pendingMemberUser.id, pendingMemberDay, group);
    }
}

const euclideanDistance = (vector1: [number, number], vector2: [number, number]): number => {
    return Math.sqrt(Math.pow((vector2[0] - vector1[0]), 2) + Math.pow((vector2[1] - vector1[1]), 2));
}
