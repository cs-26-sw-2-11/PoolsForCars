import {
    getRoute,
    type DirectionsResponse,
    type Route,
    type RouteSummary,
} from "../ors.service.js";
import * as calendarDayModel from "../../models/calendar_day.model.js";
import * as groupModel from "../../models/group.model.js";
import * as costModel from "../../models/cost.model.js";
import * as compatibilityModel from "../../models/compatibility.model.js";
import * as userModel from "../../models/user.model.js";
import * as groupExecutor from "./group.executor.js";
import { findEligbleDrivers } from "../../matching/temporal_compatibility.js";
import type { Location } from "../../models/location.model.js";

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
    name: string;
    location: Location;
    destination: Coord;
}

export interface InsertionPlan {
    insertionCandidate: Candidate;

    previousUserId: number;
    currentUserId: number;
    nextUserId: number | null;
    routeOrder: number[];

    routes: groupExecutor.Routes;

    newTotalTravelTime: number;
    estimatedAddedDetour: number;
    totalDetour: number;

    mapsLink: string;
}

const ACCEPTED_DETOUR: number = 10 * 60;

export const getGroup = async (id: number): Promise<groupModel.Group> => {
    return await groupModel.readGroup(id);
};

export const getAllUserGroups = async (
    userId: number,
): Promise<groupModel.Group[]> => {
    const user: userModel.User = await userModel.readUser(userId);
    const groupIds: number[] = user.driverInGroups.concat(
        user.passengerInGroups,
    );
    const groups: groupModel.Group[] = await Promise.all(
        groupIds.map((groupId) => groupModel.readGroup(groupId)),
    );
    return groups;
};

export const getAllUserGroupsAsDriver = async (
    userId: number,
): Promise<groupModel.Group[]> => {
    const user: userModel.User = await userModel.readUser(userId);

    const groups: groupModel.Group[] = await Promise.all(
        user.driverInGroups.map((groupId) => groupModel.readGroup(groupId)),
    );

    return groups;
};

export const getAllUserGroupsAsPassenger = async (
    userId: number,
): Promise<groupModel.Group[]> => {
    const user: userModel.User = await userModel.readUser(userId);
    const groups: groupModel.Group[] = await Promise.all(
        user.passengerInGroups.map((groupId) => groupModel.readGroup(groupId)),
    );
    return groups;
};

const buildNewGroup = (
    user: userModel.User,
    day: calendarDayModel.CalendarDay,
    costToDestination: costModel.Cost,
    dayString: string,
    weekNumber: number,
): groupModel.Group => {
    const member: groupModel.GroupMember = {
        userId: user.id,
        name: user.firstName + " " + user.lastName,
        location: day.pickupPoint,
        toNext: null,
        toDestination: costToDestination,
    };

    const timeOfArrival: number = day.timeOfArrival
        .split(":")
        .map(Number)
        .reduce((h, m) => (h * 60 + m) * 60);
    const group: groupModel.Group = {
        id: 0, // placeholder
        day: dayString,
        week: weekNumber,
        timeOfArrival: timeOfArrival,
        seatsOffered: day.seatsOffered,
        members: [member],
        pendingMembers: {},
        bannedMembers: [],
        destination: day.destination,
        route: [
            {
                userId: member.userId,
                name: member.name,
                time:
                    timeOfArrival -
                    (member.toDestination.travelTimeSeconds ?? 0),
                address: member.location.address,
            },
        ],
        totalTravelTimeSeconds: costToDestination.travelTimeSeconds as number,
        totalDetourTimeSeconds: 0,
        totalTravelDistanceMeters:
            costToDestination.travelDistanceMeters as number,
        // totalTravelDistanceEuclidiean: costToDestination.distanceEuclidean,
        // metersPerEuclideanDistAverage:
        //     Number(costToDestination.travelDistanceMeters) /
        //     costToDestination.distanceEuclidean,
        // secsPerMeterAverage:
        //     Number(costToDestination.travelTimeSeconds) /
        //     Number(costToDestination.travelDistanceMeters),
        mapsLink: "",
    };

    return group;
};

const makeNewGroup = async (
    user: userModel.User,
    day: calendarDayModel.CalendarDay,
    dayString: string,
    weekNumber: number,
) => {
    const routeToDestination: DirectionsResponse = await getRoute(
        day.pickupPoint.coordinates,
        day.destination.coordinates,
    );

    const summary: RouteSummary = routeToDestination.routes[0]
        ?.summary as RouteSummary;
    if (!summary) throw new Error("No route");

    const costToDestination: costModel.Cost = {
        travelTimeSeconds: summary.duration,
        travelDistanceMeters: summary.distance,
        distanceEuclidean: euclideanDistance(
            day.pickupPoint.coordinates,
            day.destination.coordinates,
        ),
    };

    const group: groupModel.Group = buildNewGroup(
        user,
        day,
        costToDestination,
        dayString,
        weekNumber,
    );

    const saved: groupModel.Group = await groupModel.createGroup(group);

    return saved;
};

export const makeNewGroups = async (
    user: userModel.User,
): Promise<number[]> => {
    const userDriverGroups: number[] = [];

    for (const [weekNum, week] of Object.entries(user.calendar)) {
        for (const [dayKey, day] of Object.entries(week.days)) {
            if (!(day.carpoolingIntent && day.carAvailability)) continue;
            if (day.groups[0] !== null) continue;

            const group: Group = await makeNewGroup(
                user,
                day,
                dayKey,
                Number(weekNum),
            );

            userDriverGroups.push(group.id);
            if (!day.groups[0]) {
                day.groups[0] = group.id;
            } else if (!day.groups[1]) {
                day.groups[1] = group.id;
            } else {
                throw new Error(
                    "Error while making group. Both drivers morning and evening group slots are filled",
                );
            }
        }
    }

    return userDriverGroups;
};

export const findCandidatePairs = (
    user: userModel.User,
    compatibilityMap: compatibilityModel.WeeklyCompatibilityIndex,
): CandidatePair[] => {
    const pairs: CandidatePair[][] = [];

    for (const [weekNum, week] of Object.entries(user.calendar)) {
        for (const dayKey in week.days) {
            pairs.push(
                findCompatibleCandidatePairs(
                    user,
                    compatibilityMap,
                    Number(weekNum),
                    dayKey,
                ),
            );
        }
    }

    return pairs.flat();
};

export const findCompatibleCandidatePairs = (
    user: userModel.User,
    compatibilityMap: compatibilityModel.WeeklyCompatibilityIndex,
    weekNum: number,
    dayKey: string,
): CandidatePair[] => {
    const day: calendarDayModel.CalendarDay = user.calendar[weekNum]?.days[
        dayKey
    ] as calendarDayModel.CalendarDay;

    const pairs: CandidatePair[] = [];

    for (const match of compatibilityMap.sortedAccumulator ?? []) {
        if (
            !compatibilityMap.weeks[Number(weekNum)]?.[
                compatibilityModel.convertToDayname(dayKey)
            ][match.id]
        )
            continue;

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
};

export const searchForGroups = async (
    user: userModel.User,
    compatibilityMap: compatibilityModel.WeeklyCompatibilityIndex,
    dayInfo?: {
        week: number;
        day: string;
    } | null,
): Promise<void> => {
    const pairs: CandidatePair[] = dayInfo
        ? findCompatibleCandidatePairs(
              user,
              compatibilityMap,
              dayInfo.week,
              dayInfo.day,
          )
        : findCandidatePairs(user, compatibilityMap);

    for (const pair of pairs) {
        if (typeof pair.driver !== "object" && pair.driver !== null) {
            pair.driver = await userModel.readUser(pair.driver);
        }
        if (!pair.driver) throw new Error("Could not read candidate driver");

        if (typeof pair.passenger !== "object" && pair.passenger !== null) {
            pair.passenger = await userModel.readUser(pair.passenger);
        }
        if (!pair.passenger)
            throw new Error("Could not read candidate passenger");

        pair.driverDay = pair.driver.calendar[pair.week]?.days[
            pair.day
        ] as calendarDayModel.CalendarDay;
        if (!pair.driverDay)
            throw new Error("Could not read candidate drivers calendar day");
        pair.passengerDay = pair.passenger.calendar[pair.week]?.days[
            pair.day
        ] as calendarDayModel.CalendarDay;
        if (!pair.passengerDay)
            throw new Error("Could not read candidate passengers calendarday");

        const group: groupModel.Group = await groupModel.readGroup(
            Number(pair.driverDay.groups[0]),
        );

        if (group.members.length >= group.seatsOffered + 1) continue;

        const plan: InsertionPlan | null = await planInsertion(
            group,
            {
                userId: pair.passenger.id,
                name: pair.passenger.firstName + " " + pair.passenger.lastName,
                location: pair.passengerDay.pickupPoint,
                destination: group.destination.coordinates,
            },
            ACCEPTED_DETOUR,
        );

        if (!plan) continue;

        group.pendingMembers[pair.passenger.id] = plan;

        await groupModel.updateGroup(group.id, group);

        console.log(JSON.stringify(pair.passengerDay));
        pair.passengerDay.pendingGroups.push(group.id);

        await userModel.updateUser(pair.passenger.id, pair.passenger);
    }
};

export const planInsertion = async (
    group: groupModel.Group,
    candidate: Candidate,
    ACCEPTED_DETOUR: number,
): Promise<InsertionPlan | null> => {
    // Contruct array of user ids and distance to destination
    // Append user to this array and sort it
    const distsToDest: { id: number; distance: number }[] = group.members.map(
        (member) => ({
            id: member.userId,
            distance: member.toDestination.distanceEuclidean,
        }),
    );

    const candidateDistanceToDestination: number = euclideanDistance(
        candidate.location.coordinates,
        candidate.destination,
    );

    distsToDest.push({
        id: candidate.userId,
        distance: candidateDistanceToDestination,
    });

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
    const candidateIndex: number = distsToDest.findIndex(
        (x) => x.id === candidate.userId,
    );
    console.log("User Index", candidateIndex);

    // Early returns
    if (candidateIndex === -1) return null;
    if (candidateIndex === 0) return null;

    const previousId: number | null =
        distsToDest[candidateIndex - 1]?.id ?? null;
    const nextId: number | null = distsToDest[candidateIndex + 1]?.id ?? null;

    if (previousId === null) return null;

    const previousMember = group.members.find(
        (member) => member.userId === previousId,
    );
    if (!previousMember) return null;
    console.log("Previous member", previousMember);

    const nextMember = nextId
        ? group.members.find((members) => members.userId === nextId)
        : null;

    const nextCoords: Coord = nextMember
        ? nextMember.location.coordinates
        : group.destination.coordinates;

    const prevToCurrRoute: RouteSummary | undefined = (
        await getRoute(
            previousMember.location.coordinates,
            candidate.location.coordinates,
        )
    ).routes[0]?.summary;
    if (typeof prevToCurrRoute === "undefined")
        throw new Error(
            "Error calculating route from previous member to candidate.",
        );

    const currToNextRoute: RouteSummary | undefined = (
        await getRoute(candidate.location.coordinates, nextCoords)
    ).routes[0]?.summary;
    if (typeof currToNextRoute === "undefined")
        throw new Error(
            "Error calculating route from candidate to next member.",
        );

    // const prevToCurrDistance: number = euclideanDistance(
    //     previousMember.coordinates,
    //     candidate.coordinates
    // );
    //
    // const currToNextDistance: number = euclideanDistance(
    //     candidate.coordinates,
    //     nextCoords
    // );
    //
    //
    // const prevToCurrTT: number =
    //     prevToCurrDistance *
    //     group.metersPerEuclideanDistAverage *
    //     group.secsPerMeterAverage;
    //
    // const currToNextTT: number =
    //     currToNextDistance *
    //     group.metersPerEuclideanDistAverage *
    //     group.secsPerMeterAverage;
    const prevToCurrDistance: number = prevToCurrRoute.distance;
    const currToNextDistance: number = currToNextRoute.distance;

    const prevToCurrTT: number = prevToCurrRoute.duration;
    const currToNextTT: number = currToNextRoute.duration;

    console.log(
        `Testing user ${candidate.userId} against group`,
        JSON.stringify(group, null, 2),
    );
    console.log(distsToDest);
    console.log(
        "previous:",
        previousMember,
        "current:",
        candidate,
        "next:",
        nextMember ? nextMember : nextCoords,
        "dest:",
        group.destination,
    );

    console.log(
        "prevToCurrUserDist:",
        prevToCurrDistance,
        "currToNextUserDist:",
        currToNextDistance,
        "prevToCurrUserTT:",
        prevToCurrTT,
        "currToNextUserTT:",
        currToNextTT,
    );

    let removedTime: number;
    if (previousMember.toNext) {
        removedTime = previousMember.toNext.travelTimeSeconds ?? 0;
    } else {
        removedTime = previousMember.toDestination.travelTimeSeconds ?? 0;
    }

    console.log("OG totalTravelTime:", group.totalTravelTimeSeconds);

    const trimmedTotal: number = group.totalTravelTimeSeconds - removedTime;
    console.log("totalTravelTime - link:", trimmedTotal);

    const newTotalTravelTime: number =
        trimmedTotal + prevToCurrTT + currToNextTT;
    console.log("totalTravelTime + new links:", newTotalTravelTime);

    const driverToDestTT: number =
        group.members[0]?.toDestination.travelTimeSeconds ?? 0;
    console.log("driverToDestTT:", driverToDestTT);

    const totalDetour: number = newTotalTravelTime - driverToDestTT;

    if (totalDetour > ACCEPTED_DETOUR) {
        return null;
    }

    const routeOrder: number[] = distsToDest.map((x) => x.id);

    const insertionPlan: InsertionPlan = {
        insertionCandidate: candidate,
        previousUserId: previousId,
        currentUserId: candidate.userId,
        nextUserId: nextId,
        routeOrder: routeOrder,
        routes: {
            prevToCurr: {
                travelTimeSeconds: prevToCurrTT,
                travelDistanceMeters: prevToCurrDistance,
                distanceEuclidean: euclideanDistance(
                    previousMember.location.coordinates,
                    candidate.location.coordinates,
                ),
            },
            currToNext: nextMember
                ? {
                      travelTimeSeconds: currToNextTT,
                      travelDistanceMeters: currToNextDistance,
                      distanceEuclidean: euclideanDistance(
                          candidate.location.coordinates,
                          nextCoords,
                      ),
                  }
                : null,
            currToDest: {
                travelTimeSeconds: nextMember ? null : currToNextTT,
                travelDistanceMeters: nextMember ? null : currToNextDistance,
                distanceEuclidean: candidateDistanceToDestination,
            },
            isDestination: nextMember ? false : true,
        },
        newTotalTravelTime: newTotalTravelTime,
        estimatedAddedDetour: prevToCurrTT + currToNextTT - removedTime,
        totalDetour: totalDetour,
        mapsLink: "",
    };
    insertionPlan.mapsLink = makeGroupMapsLink(group, insertionPlan);

    return insertionPlan;
};

export const makeGroupMapsLink = (
    group: Group,
    plan?: InsertionPlan,
): string => {
    let link: string = `https://www.google.com/maps/dir/?api=1&origin=${group.members[0]?.location.coordinates[0]}%2C${group.members[0]?.location.coordinates[1]}&destination=${group.destination?.coordinates[0]}%2C${group.destination?.coordinates[1]}&travelmode=driving&waypoints=`;

    for (const [index, member] of Object.entries(group.route)) {
        const member: GroupMember | undefined = group.members.find(
            (member) => member.userId === member.userId,
        );
        if (typeof member === "undefined")
            throw new Error(
                "Error getting member coordinates when creating Maps Link.",
            );

        if (Number(member.userId) === 0) continue;

        if (typeof plan !== "undefined") {
            if (
                group.route[Number(index) - 1]?.userId ===
                    plan.previousUserId &&
                group.route[Number(index) + 1]?.userId === plan.nextUserId
            ) {
                link += `${plan.insertionCandidate.location.coordinates[0]}%2C${plan.insertionCandidate.location.coordinates[1]}%7C`;
            }
        }

        link += `${member.location.coordinates[0]}%2C${member.location.coordinates[1]}%7C`;
    }

    return link;
};

// const buildRoutesForPlan = async (
//     group: groupModel.Group,
//     plan: InsertionPlan,
// ): Promise<groupExecutor.Routes> => {
//
//     const previousMember: groupModel.GroupMember = group.members.find(
//         x => x.userId === plan.previousUserId
//     ) as groupModel.GroupMember;
//     const currentMember: groupModel.GroupMember = group.members.find(
//         x => x.userId === plan.currentUserId
//     ) as groupModel.GroupMember;
//     const nextMember: groupModel.GroupMember | null = plan.nextUserId
//         ? group.members.find(x => x.userId === plan.currentUserId) as groupModel.GroupMember
//         : null;
//
//
//     const prevToCurrRoute: DirectionsResponse = await getRoute(previousMember?.coordinates, currentMember?.coordinates);
//     const prevToCurrSummary: RouteSummary = prevToCurrRoute.routes[0]?.summary as RouteSummary;
//
//     const currToNextRoute: DirectionsResponse | null = plan.nextUserId
//         ? await getRoute(
//             currentMember?.coordinates,
//             nextMember?.coordinates as [number, number]
//         )
//         : null;
//     const currToNextSummary: RouteSummary | null = currToNextRoute ? currToNextRoute.routes[0]?.summary as RouteSummary : null;
//
//     const currToDestRoute: DirectionsResponse = await getRoute(currentMember?.coordinates, group.destination.coordinates);
//     const currToDestSummary: RouteSummary = currToDestRoute.routes[0]?.summary as RouteSummary;
//
//     const routes: groupExecutor.Routes = {
//         prevToCurr: {
//             travelDistanceMeters: prevToCurrSummary.distance,
//             travelTimeSeconds: prevToCurrSummary.duration,
//             distanceEuclidean: plan.prevToCurrDistance,
//         },
//         currToNext: currToNextRoute && currToNextSummary ? {
//             travelDistanceMeters: currToNextSummary.distance,
//             travelTimeSeconds: currToNextSummary.duration,
//             distanceEuclidean: plan.currToNextDistance,
//         } : null,
//         currToDest: {
//             travelDistanceMeters: currToDestSummary.distance,
//             travelTimeSeconds: currToDestSummary.duration,
//             distanceEuclidean: euclideanDistance(plan.insertionCandidate.coordinates, group.destination.coordinates),
//         },
//         isDestination: currToNextRoute ? false : true,
//     };
//
//     return routes;
// }

export const appendPassengerToGroup = async (
    group: Group,
    plan: InsertionPlan,
    // candidate: Candidate,
): Promise<Group> => {
    const updatedGroup: groupModel.Group = groupExecutor.applyInsertion(
        group,
        plan,
        // routes,
    );

    delete updatedGroup.pendingMembers[plan.insertionCandidate.userId];

    return updatedGroup;
};

export const denyPassengerFromGroup = async (
    group: Group,
    candidate: Candidate,
): Promise<Group> => {
    // Delete element of member from pendingMembers Record
    delete group.pendingMembers[candidate.userId];

    // Add users id to banned members - they cant be added again.
    group.bannedMembers.push(candidate.userId);

    // Persist to database
    await groupModel.updateGroup(group.id, group);

    return group;
};

export const refreshPendingMembers = async (group: Group): Promise<Group> => {
    for (const memberKey in group.pendingMembers) {
        const user: userModel.User = await userModel.readUser(
            Number(memberKey),
        );

        const memberCompatibilityMap: compatibilityModel.WeeklyCompatibilityIndex =
            await findEligbleDrivers(user, await userModel.readUsers());

        await searchForGroups(user, memberCompatibilityMap, {
            week: group.week,
            day: group.day,
        });
    }

    return group;
};

const euclideanDistance = (
    vector1: [number, number],
    vector2: [number, number],
): number => {
    return Math.sqrt(
        Math.pow(vector2[0] - vector1[0], 2) +
            Math.pow(vector2[1] - vector1[1], 2),
    );
};
