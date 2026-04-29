import { getRoute, type Route } from "../../openrouteservice.js";
import { type AppendPassengerDTO } from "./dto/appendPassenger.dto.js"
import type { Group, GroupMember } from "./group.service.js";

export const buildAppendPassengerDTO = async (
    group: Group,
    previousMember: GroupMember,
    candidateMember: GroupMember,
    nextMember: GroupMember | null,
    nextCoords: [number, number],
    previousIndex: number,
    nextIndex: number,
    prevToCandMemberDist: number,
    candToNextMemberDist: number,
    totalDetour: number,
    newTotalTravelTime: number,
    routeOrder: number[],
): Promise<AppendPassengerDTO> => {
    const prevToCandRoute: Route = (await getRoute(previousMember.coordinates, candidateMember.coordinates)).routes[0] as Route;
    const candToNextRoute: Route = (await getRoute(candidateMember.coordinates, nextCoords)).routes[0] as Route;
    let candToDestRoute: Route;
    if (nextMember === null) {
        candToDestRoute = (await getRoute(candidateMember.coordinates, group.destination.coordinates)).routes[0] as Route;
    }

    let totalDistanceTravel: number = group.totalTravelDistanceMeters + prevToCandRoute.summary.distance + candToNextRoute.summary.distance;
    let totalDistanceEuclidiean: number = group.totalTravelDistanceEuclidiean + prevToCandMemberDist + candToNextMemberDist;

    const appendPassengerDTO: AppendPassengerDTO = {
        groupId: group.id,
        candidateMember: {
            userId: candidateMember.userId,
            coordinates: candidateMember.coordinates,
        },
        previousIndex: previousIndex,
        nextIndex: nextIndex,
        prevToCand: {
            distanceEuclidean: prevToCandMemberDist,
            travelTimeSeconds: prevToCandRoute.summary.duration,
            travelDistanceMeters: prevToCandRoute.summary.distance,
        },
        candToNext: nextMember === null ? {
            distanceEuclidean: candToNextMemberDist,
            travelTimeSeconds: candToNextRoute.summary.duration,
            travelDistanceMeters: candToNextRoute.summary.distance,
        } : null,
        candToDest: {
            distanceEuclidean: candToNextMemberDist,
            travelTimeSeconds: candToNextRoute.summary.duration,
            travelDistanceMeters: candToNextRoute.summary.distance,

        },
        isNextDestination: nextMember === null ? true : false,
        addedTotalTravelTime: prevToCandRoute.summary.duration + candToNextRoute.summary.duration,
        newTotalTravelTime: newTotalTravelTime,
        totalDetour: totalDetour,
        routeOrder: routeOrder,
        totalTravelDistanceMeters: totalDistanceTravel,
        totalTravelDistanceEuclidiean: totalDistanceEuclidiean,
        secsPerMeterAverage: newTotalTravelTime / totalDistanceTravel,
        metersPerEuclideanDistAverage: totalDistanceTravel / totalDistanceEuclidiean,
    }
    return appendPassengerDTO;
}
