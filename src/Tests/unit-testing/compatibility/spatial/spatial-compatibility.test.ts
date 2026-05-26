import { describe, expect, test } from "vitest";
import {
    type Group,
    planInsertion,
} from "../../../../services/groups/group.service";
import { dateToWeek } from "../../../../models/calendar.model";
import { type Location } from "../../../../models/location.model";

describe("", () => {
    test.todo("add tests");
});

/*
const todaysWeek: number = await dateToWeek(new Date());

const mockGroup: Group = {
    id: 0,
    day: "Monday",
    week: todaysWeek,
    timeOfArrival: 32400,
    seatsOffered: 4,
    members: [],
    pendingMembers: [],
    bannedMembers: [],
    destination: {

    } as Location,
    route: [], // optimized order
    totalTravelTimeSeconds: 0,
    totalDetourTimeSeconds: 0,
    totalTravelDistanceMeters: 0,
    mapsLink: "",

}




planInsertion();
*/
