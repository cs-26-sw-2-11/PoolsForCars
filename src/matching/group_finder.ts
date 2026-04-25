import type { CalendarDay } from "../models/calendar_day.model.js";
import { convertToDayname, type WeeklyCompatibilityIndex } from "../models/compatibility.model.js";
import { createGroup, initGroups, readGroup, type Group } from "../models/group.model.js";
import { initUsers, readUser, readUsers, updateUser, type User, type Users } from "../models/user.model.js";
import type { Week } from "../models/week.model.js";
import type { Calendar } from "../models/calendar.model.js";
import { findEligbleDrivers } from "./temporal_compatibility.js";
import type { Cost } from "../models/cost.model.js";
import { getRoute } from "../openrouteservice.js";
import express from "express";
import * as userModel from '../models/user.model.js';





const ACCEPTED_DETOUR: number = 10 * 60;

/* findCompatibleCandidates:
 * Recieve user as input
 * Loops over all weeks in users calender as week
 * Loops over all days in week as day
 * Loops over all users in the database as possibleCandidate
 * Check if possibleCandidate has the intent to carpool on this day
 * If user == passenger ; check if possibleCandidate == driver
 * If user == driver ; check if possibleCandidate == passenger
 * All checks passed.
 * Calculate temporal compatibility between user and possibleCandidate
 * If temporal compatibility != 0 ;
 *      append possibleCandidate to list of candidates on this day
 *      and
 *      add temporal combatibility score to the candidates sum
 * When all candidates for all days have been found, order the list of temporal compatibilitty scores
 * Return combatibility object
 *
 *
 * searchForGroups:
 * Recieve user as input
 * Run findCompatibleCandidates() and recieve object of candidates with compatibility scores
 * Loops over all weeks in users calender as week
 * Loops over all days in week as day
 * Loops over all candidates from sorted list
 * Checks if candidate is in list of compatible candidates on this day
 * Run testGroup with users day and candidates day as input 
 *
 *
 * testGroup:
 * Make a new temporary group
 * Make an empty list of distances to destination
 * Calculate and append users distance to destination to list
 * Loop over all users in candidate group
 * Calculate and append distance to destination for all users to list
 * When all distances have been calculated, order by largest to smallest (driver should be first, destination should be last)
 * Loop over all users in list until the current user is found
 * Use the groups average secsPerKm and kmPerEuclideanDist to calculate travel distance from the previous user and to the next user
 * Calculate a total travel time without the edge, which would be broken if this user joined the group
 * Add the new travel times for the new edges to and from this user
 * If (new travel time - straight route from driver to destination) > max accepted detour ; user is not suitable for group
 * Else ;
 *      Call ORS API to get route from previous user --> user and route from user --> next user in the route order
 *      Calculate travel times and detour again with actual route data
 *      If detour is not too high ; add user to group
 *      Else ; user is not suitable for group
 *
 *
 * Assumptions:
 *  - A group will always have actual all 3 parameters of the cost object filled out for all users in route
 *  - A group will always have an average secsPerKm and kmPerEuclideanDist
 *
 *
*/


export const findGroups = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const user: userModel.User = await userModel.readUser(Number(req.params['userId']));
        const compatibility: WeeklyCompatibilityIndex = await findEligbleDrivers(user);
        await searchForGroups(user, compatibility);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error creating a user' });
    }

}


export const searchForGroups = async (user: User, compatibility: WeeklyCompatibilityIndex) => {
    for (let weekNumber in user.calender) {
        const userWeek: Week = user.calender[weekNumber] as Week;
        for (let dayString in userWeek.days) {
            const userDay: CalenderDay = userWeek.days[dayString] as CalenderDay;
            for (let candidate of compatibility.sortedAccumulator ?? []) {
                if (compatibility.weeks[weekNumber] === undefined) continue; // checks if the week is undefined
                if (!compatibility.weeks[weekNumber][convertToDayname(dayString)][candidate[0]]) continue; // checks if the candidate is
                // compatible with the user on this day

                const candidateUser: User = await readUser(candidate[0]);
                const candidateDay: CalenderDay = candidateUser.calender[weekNumber]?.days[dayString] as CalenderDay;
                await testGroup(user.id, userDay, candidateUser.id, candidateDay);
            }
        }
    }
}


/*
 * testGroup:
 * Make a new temporary group
 * Make an empty list of distances to destination
 * Calculate and append users distance to destination to list
 * Loop over all users in candidate group
 * Calculate and append distance to destination for all users to list
 * When all distances have been calculated, order by largest to smallest (driver should be first, destination should be last)
 * Loop over all users in list until the current user is found
 * Use the groups average secsPerKm and kmPerEuclideanDist to calculate travel distance from the previous user and to the next user
 * Calculate a total travel time without the edge, which would be broken if this user joined the group
 * Add the new travel times for the new edges to and from this user
 * If (new travel time - straight route from driver to destination) > max accepted detour ; user is not suitable for group
 * Else ;
 *      Call ORS API to get route from previous user --> user and route from user --> next user in the route order
 *      Calculate travel times and detour again with actual route data
 *      If detour is not too high ; add user to group
 *      Else ; user is not suitable for group
 *
 *
 * Assumptions:
 *  - A group will always have actual all 3 parameters of the cost object filled out for all users in route
 *  - A group will always have an average secsPerKm and kmPerEuclideanDist
 */


const testGroup = async (userId: number, userDay: CalenderDay, candidateId: number, candidateDay: CalenderDay) => {
    const candidateGroups: [number | null, number | null] = candidateDay.groups as [number | null, number | null];
    if (candidateGroups[0] === null && candidateGroups[1] === null) {
        return;
    }

    const candidateMorningGroup: Group = await readGroup(Number(candidateGroups[0])) as Group;

    // [[[userId, [LAN, LON]], distance]]
    const userDistancesToDestination: [[number, [number, number]], number][] = [
        [
            [userId, userDay.pickupPoint.coordinates],
            euclideanDistance(userDay.destination.coordinates, candidateDay.destination.coordinates)
        ]
    ];

    for (let user of candidateMorningGroup.row_labels) {
        userDistancesToDestination.push([user, euclideanDistance(user[1], candidateDay.destination.coordinates)])
    }

    userDistancesToDestination.sort((a, b) => a[1] - b[1]); // check how its sorted (ascending or descending)

    let userIndex: number = 0;
    for (const item of userDistancesToDestination.entries()) {
        const index = item[0];
        const user = item[1];
        if (user[0][0] === userId)
            userIndex = index;
        break;
    }

    if (userDistancesToDestination[userIndex - 1] === undefined) return;
    const previousUser: [number, [number, number]] = userDistancesToDestination[userIndex - 1]?.[0] as [number, [number, number]];
    const currentUser: [number, [number, number]] = userDistancesToDestination[userIndex]?.[0] as [number, [number, number]];
    const nextUser: [number, [number, number]] = userDistancesToDestination[userIndex + 1]?.[0] as [number, [number, number]];
    const distanceFromPreviousToCurrentUser: number = euclideanDistance(previousUser[1], currentUser[1]);
    const distanceFromCurrentToNextUser: number = euclideanDistance(currentUser[1], nextUser[1]);

    const travelTimePreviousToCurrentUser: number =
        distanceFromPreviousToCurrentUser *
        candidateMorningGroup.kmPerEuclideanDistAverage *
        candidateMorningGroup.secsPerKmAverage;
    const travelTimeCurrentToNextUser: number =
        distanceFromCurrentToNextUser *
        candidateMorningGroup.kmPerEuclideanDistAverage *
        candidateMorningGroup.secsPerKmAverage;

    let previousUserIndex: number = 0;
    let nextUserIndex: number = 0;
    for (const item of candidateMorningGroup.row_labels.entries()) {
        if (previousUser[0] === item[1][0]) previousUserIndex = item[0];
        if (nextUser[0] === item[1][0]) nextUserIndex = item[0];
    }


    let totalTravelTime: number = candidateMorningGroup.totalTravelTimeSeconds;
    const oldEdge: Cost[] = findEdge(candidateMorningGroup.values, previousUserIndex, nextUserIndex);
    totalTravelTime -= (oldEdge[previousUserIndex] as Cost).travelTimeSeconds;

    const driverToDestEdge: Cost[] = findEdge(candidateMorningGroup.values, 0, 1);
    if (
        Math.abs(
            (totalTravelTime + travelTimePreviousToCurrentUser + travelTimeCurrentToNextUser) - (driverToDestEdge[0] as Cost).travelTimeSeconds
        ) > ACCEPTED_DETOUR
    ) {
        console.log("Detour too large for user");
        return;
    }


    console.log("Detour is acceptable");





    // let groupCandidate: Group;
    // if (candidateGroups[0] == null) {
    //     groupCandidate = await makeNewGroup(candidate, week, day);
    // } else {
    //     console.log("group found");
    //     groupCandidate = await readGroup(candidateGroups[0]);
    // }

    // check if candidate is already in a group on this day.
    // if no: make new group for driver on this day.


}











const findEdge = (matrix: Cost[][], index1: number, index2: number): Cost[] => {
    for (const edge of matrix) {
        if (JSON.stringify(edge[index1]) !== JSON.stringify(edge[index2])) continue;
        return edge;
    }
    return {} as Cost[];
}



const euclideanDistance = (vector1: [number, number], vector2: [number, number]): number => {
    return Math.sqrt(Math.pow((vector2[0] - vector1[0]), 2) + Math.pow((vector2[1] - vector1[1]), 2));
}


const makeNewGroup = async (user: User, week: number, day: string) => {
    const group: Group = {
        id: 0,
        rows: 0,
        columns: 0,
        row_labels: [],
        column_labels: [],
        values: [],
        route: [],
        totalTravelTimeSeconds: 0,
        totalDetourTimeSeconds: 0,
        secsPerKmAverage: 0,
        kmPerEuclideanDistAverage: 0,
    };

    const userDay = user.calender[week]?.days[day];
    const v1: number = addGroupVertex(group, user.id, userDay?.pickupPoint.coordinates as [number, number]);
    const v2: number = addGroupVertex(group, user.id, userDay?.destination.coordinates as [number, number]);
    const e1: number = addGroupEdge(group, v1, v2);


    const vertex1 = group.row_labels[v1] ?? [0, [0, 0]];
    const vertex2 = group.row_labels[v2] ?? [0, [0, 0]];

    const route = await getRoute(vertex1[1], vertex2[1]);
    const routeTravelTime: number = route.routes[0]?.summary.duration as number;
    const routeTravelDistance: number = route.routes[0]?.summary.distance as number;
    const distanceEuclidean: number = euclideanDistance(vertex1[1], vertex2[1]);
    console.log("TRAVEL TIME:", routeTravelTime);
    //
    // const routeTravelTime: number = 20;

    if (group.values[e1] !== undefined) {
        console.log("Writing travel times");
        const v1Cost: Cost = group.values[e1][v1] as Cost;
        const v2Cost: Cost = group.values[e1][v2] as Cost;
        v1Cost.travelTimeSeconds = routeTravelTime;
        v2Cost.travelTimeSeconds = routeTravelTime;
        v1Cost.travelDistanceMeters = routeTravelDistance;
        v2Cost.travelDistanceMeters = routeTravelDistance;
        v1Cost.distanceEuclidean = distanceEuclidean;
        v2Cost.distanceEuclidean = distanceEuclidean;
    }

    const newGroup = await createGroup(group);
    user.groups[0] = newGroup.id;
    if (userDay?.groups !== undefined) {
        userDay.groups[0] = newGroup.id;
    }
    updateUser(user.id, user);
    return newGroup;
}


function addGroupVertex(group: Group, userId: number, coordinates: [number, number]) {
    group.row_labels.push([userId, coordinates]);
    return group.rows++;
}

function addGroupEdge(group: Group, v1_index: number, v2_index: number) {
    // add a column label for the new column
    group.column_labels.push(group.columns++);

    let newColumn: Cost[] = [];
    for (let i = 0; i < group.rows; i++) {
        let cost: Cost = {
            travelTimeSeconds: 0,
            straightLineDistance: 0
        };
        newColumn.push(cost);
    }


    let row1: [number, [number, number]] = group.row_labels[v1_index] ?? [0, [0, 0]];
    let row2: [number, [number, number]] = group.row_labels[v2_index] ?? [0, [0, 0]];

    let v1v2straghtLineDistance =
        Math.sqrt(
            Math.pow(row2[1][0] - row1[1][0], 2) +
            Math.pow(row2[1][1] - row1[1][1], 2)
        );

    if (newColumn[v1_index] !== undefined &&
        newColumn[v2_index] !== undefined) {
        newColumn[v1_index].straightLineDistance = v1v2straghtLineDistance;
        newColumn[v2_index].straightLineDistance = v1v2straghtLineDistance;
    }

    group.values.push(newColumn);
    return group.columns - 1;
}



await findGroups(user);





















































// // check if candidate is already in a group on this day.
// // if no: make new group for driver on this day.
//
//
//
//
// /*
// interface Cost {
//     actual: number,
//     heuristic: number
// }
//
// interface Group {
//     rows: number,
//     columns: number
//     row_labels: [number, number][]
//     column_labels: string[]
//     values: Cost[][]
// }
//
//
// const groups: Group[] = [];
// const newGroup: Group = {
//     rows: 5,
//     columns: 0,
//     row_labels: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
//     column_labels: [],
//     values: []
// };
//
// function add_group_vertex(group: Group, coordinates: [number, number], index: number) {
//     group.row_labels[index] = coordinates;
// }
//
// function add_group_edge(group: Group, v1_index: number, v2_index: number) {
//     group.column_labels.push(`e${group.columns}`);
//
//     let newColumn: Cost[] = [];
//
//     for (let i = 0; i < group.rows; i++) {
//         let cost: Cost = {actual: 0, heuristic: 0};
//         newColumn.push(cost);
//     }
//
//     let row1: [number, number] = [0, 0];
//     let row2: [number, number] = [0, 0];
//
//     if (group.row_labels[v1_index] !== undefined && group.row_labels[v2_index] !== undefined) {
//         row1 = group?.row_labels[v1_index];
//         row2 = group?.row_labels[v2_index];
//     }
//
//     let cost =
//         Math.sqrt(
//             Math.pow(row2[0] - row1[0], 2) +
//             Math.pow(row2[1] - row1[1], 2)
//     );
//
//     if (newColumn[v1_index] !== undefined && newColumn[v2_index] !== undefined) {
//         newColumn[v1_index].heuristic = cost;
//         newColumn[v2_index].heuristic = cost;
//     }
//
//     group.values.push(newColumn);
//
//     group.columns++;
// }
//
// function calc_viability_of_group_member(group: Group, user: [number, number]) {
//     let userToVertexCosts: number[] = [];
//     group.row_labels.forEach(vertex => {
//         userToVertexCosts.push(
//             Math.sqrt(
//                 Math.pow(user[0] - vertex[0], 2) +
//                 Math.pow(user[1] - vertex[1], 2)
//             )
//         )
//
//     });
//
//     let userToFinishCosts: number[] = [];
//     let finishVertex: [number, number] = [0, 0];
//     if (group.row_labels[4] !== undefined) {
//         finishVertex = group.row_labels[4];
//     }
//     group.row_labels.forEach((vertex, index) => {
//         if (vertex !== finishVertex) {
//             userToFinishCosts.push(
//                 Math.sqrt(
//                     Math.pow(vertex[0] - finishVertex[0], 2) +
//                     Math.pow(vertex[1] - finishVertex[1], 2)
//                 )
//             )
//         }
//     })
//
//     userToFinishCosts.push(
//         Math.sqrt(
//             Math.pow(user[0] - finishVertex[0], 2) +
//             Math.pow(user[1] - finishVertex[1], 2)
//         )
//     )
//
//
//     let smallest: [number, number] = [0, userToVertexCosts[0] !== undefined ? userToVertexCosts[0] : 0];
//     userToVertexCosts.forEach((element, index)=> {
//         if (element < smallest[1]) {
//             smallest[0] = index;
//             smallest[1] = element;
//         }
//     });
//
//     console.log(userToVertexCosts, smallest);
//     console.log(userToFinishCosts);
// }
//
//
// // Add start node
// add_group_vertex(newGroup, [0, 0], 0);
// // Add destination node
// add_group_vertex(newGroup, [100, 100], newGroup.rows - 1);
//
// add_group_edge(newGroup, 0, newGroup.rows - 1);
//
// // New member
// let newUser1: [number, number] = [50, 8];
// let newUser2: [number, number] = [60, 50];
// add_group_vertex(newGroup, newUser1, 1);
// add_group_vertex(newGroup, newUser2, 2);
// add_group_edge(newGroup, 0, 1);
// add_group_edge(newGroup, 1, 2);
// add_group_edge(newGroup, 2, newGroup.rows - 1);
//
//
// let newUser3: [number, number] = [35, 60];
// calc_viability_of_group_member(newGroup, newUser3);
//
//
// function print_group(group: Group) {
//     let string = `Rows: ${group.rows}, Columns: ${group.columns}\n`
//
//     for (let i = 0; i < group.columns; i++) {
//         string += group.column_labels[i] + " | ";
//     }
//     string += "\n";
//
//     for (let i = 0; i < group.rows; i++) {
//         string += group.row_labels[i] + " | ";
//         for (let j = 0; j < group.columns; j++) {
//             string += group.values[j][i]?.heuristic + " ";
//         };
//         string += "\n";
//     };
//     console.log(string);
// }
//
// groups.push(newGroup);
//
//
// print_group(newGroup);
// */
