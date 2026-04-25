import { getRoute, type DirectionsResponse, type Route } from "../openrouteservice.js";
import * as calendarDayModel from "../models/calendar_day.model.js";
import * as groupModel from "../models/group.model.js";
import * as costModel from "../models/cost.model.js";

export type Group = groupModel.Group;


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
        totalTravelTimeSeconds: costToDestination.travelTimeSeconds,
        totalDetourTimeSeconds: 0,
        secsPerMeterAverage: costToDestination.travelTimeSeconds / costToDestination.travelDistanceMeters,
        metersPerEuclideanDistAverage: costToDestination.travelDistanceMeters / costToDestination.distanceEuclidean,
    };


    const newGroup: groupModel.Group = await groupModel.createGroup(group);
    day.groups[0] = newGroup.id;

    return newGroup;
}



const euclideanDistance = (vector1: [number, number], vector2: [number, number]): number => {
    return Math.sqrt(Math.pow((vector2[0] - vector1[0]), 2) + Math.pow((vector2[1] - vector1[1]), 2));
}
