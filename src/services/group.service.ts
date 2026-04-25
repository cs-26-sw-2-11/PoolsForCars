import * as groupModel from "../models/group.model.js";
import * as userModel from "../models/user.model.js";


const makeNewGroup = async (user: userModel.User, week: number, day: string) => {
    const group: groupModel.Group = {
        id: 0,
        rows: 0,
        columns: 0,
        row_labels: [],
        column_labels: [],
        values: [],
        route: [],
        secsPerKmAverage: 0,
        kmPerEuclideanDistAverage: 0,
        totalTravelTimeSeconds: 0,
        totalDetourTimeSeconds: 0,
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
