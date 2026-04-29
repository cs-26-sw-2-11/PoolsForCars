export type AppendPassengerDTO = {
    groupId: number;

    // The user being inserted
    candidateMember: {
        userId: number;
        coordinates: [number, number];
    };

    // Placement in route
    previousIndex: number;
    nextIndex?: number; // undefined = destination

    // Precomputed route segments
    prevToCand: {
        distanceEuclidean: number;
        travelTimeSeconds: number;
        travelDistanceMeters: number;
    };

    candToNext: {
        distanceEuclidean: number;
        travelTimeSeconds: number;
        travelDistanceMeters: number;
    } | null;

    candToDest: {
        distanceEuclidean: number;
        travelTimeSeconds: number;
        travelDistanceMeters: number;
    }

    isNextDestination: boolean;

    addedTotalTravelTime: number;

    // Updated aggregates
    newTotalTravelTime: number;
    totalDetour: number;

    // Updated route ordering
    routeOrder: number[];

    // Updated averages
    secsPerMeterAverage: number;
    metersPerEuclideanDistAverage: number;

    totalTravelDistanceMeters: number;
    totalTravelDistanceEuclidiean: number;
};
