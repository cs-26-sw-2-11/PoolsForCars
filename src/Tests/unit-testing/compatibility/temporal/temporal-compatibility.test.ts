import { describe, expect, test } from "vitest";
import { findEligbleDrivers } from "../../../../matching/temporal_compatibility";
import { addressToCoordinates } from "../../../../services/ors.service";

import { Location } from "../../../../models/location.model";
import { User, Users } from "../../../../models/user.model";
import { Week } from "../../../../models/week.model";
import { CalendarDay } from "../../../../models/calendar_day.model";
import {
    Calendar,
    dateToWeek,
    getFirstDayOfWeek,
    getLastWorkdayOfWeek,
    weekToDate,
} from "../../../../models/calendar.model";

const incrementDay = (date: Date, days: number): Date => {
    const newDate: Date = new Date();
    newDate.setDate(date.getDate() + days);
    return newDate;
};

const todaysWeek: number = await dateToWeek(new Date());
const weekNumber: number = todaysWeek + 1;
const weekStartDate: Date = await getFirstDayOfWeek(
    await weekToDate(weekNumber),
);
const weekEndDate: Date = await getLastWorkdayOfWeek(
    await weekToDate(weekNumber),
);
const weekDates = [
    weekStartDate,
    incrementDay(weekStartDate, 1),
    incrementDay(weekStartDate, 2),
    incrementDay(weekStartDate, 3),
    weekEndDate,
];
const mockUsers: Users = new Map<number, User>() as Users;
const mockSchedule: Week = {
    startDate: weekStartDate,
    endDate: weekEndDate,
    days: {
        Monday: {
            date: weekDates[0],
            carAvailability: true,
            seatsOffered: 4,
            carpoolingIntent: true,
            pickupPoint: {
                address: "Stendyssen 123, Svenstrup, ND, Denmark",
                coordinates: [0, 0], // await addressToCoordinates("Fibigerstræde 15C, Aalborg, ND, Denmark")
            },
            destination: {
                address: "Fibigerstræde 15C, Aalborg, ND, Denmark",
                coordinates: [0, 0], // await addressToCoordinates("Fibigerstræde 15C, Aalborg, ND, Denmark")
            } as Location,
            timeOfArrival: "09:00",
            groups: [null, null],
            pendingGroups: [],
        } as CalendarDay,
        Tuesday: {
            date: weekDates[1],
            carAvailability: true,
            seatsOffered: 4,
            carpoolingIntent: true,
            pickupPoint: {
                address: "Stendyssen 123, Svenstrup, ND, Denmark",
                coordinates: [0, 0], // await addressToCoordinates("Fibigerstræde 15C, Aalborg, ND, Denmark")
            },
            destination: {
                address: "Fibigerstræde 15C, Aalborg, ND, Denmark",
                coordinates: [0, 0], // await addressToCoordinates("Fibigerstræde 15C, Aalborg, ND, Denmark")
            } as Location,
            timeOfArrival: "09:00",
            groups: [null, null],
            pendingGroups: [],
        } as CalendarDay,
        Wednesday: {
            date: weekDates[2],
            carAvailability: true,
            seatsOffered: 4,
            carpoolingIntent: true,
            pickupPoint: {
                address: "Stendyssen 123, Svenstrup, ND, Denmark",
                coordinates: [0, 0], // await addressToCoordinates("Fibigerstræde 15C, Aalborg, ND, Denmark")
            },
            destination: {
                address: "Fibigerstræde 15C, Aalborg, ND, Denmark",
                coordinates: [0, 0], // await addressToCoordinates("Fibigerstræde 15C, Aalborg, ND, Denmark")
            } as Location,
            timeOfArrival: "09:00",
            groups: [null, null],
            pendingGroups: [],
        } as CalendarDay,
        Thursday: {
            date: weekDates[3],
            carAvailability: true,
            seatsOffered: 4,
            carpoolingIntent: true,
            pickupPoint: {
                address: "Stendyssen 123, Svenstrup, ND, Denmark",
                coordinates: [0, 0], // await addressToCoordinates("Fibigerstræde 15C, Aalborg, ND, Denmark")
            },
            destination: {
                address: "Fibigerstræde 15C, Aalborg, ND, Denmark",
                coordinates: [0, 0], // await addressToCoordinates("Fibigerstræde 15C, Aalborg, ND, Denmark")
            } as Location,
            timeOfArrival: "09:00",
            groups: [null, null],
            pendingGroups: [],
        } as CalendarDay,
        Friday: {
            date: weekDates[4],
            carAvailability: true,
            seatsOffered: 4,
            carpoolingIntent: true,
            pickupPoint: {
                address: "Stendyssen 123, Svenstrup, ND, Denmark",
                coordinates: [0, 0], // await addressToCoordinates("Fibigerstræde 15C, Aalborg, ND, Denmark")
            },
            destination: {
                address: "Fibigerstræde 15C, Aalborg, ND, Denmark",
                coordinates: [0, 0], // await addressToCoordinates("Fibigerstræde 15C, Aalborg, ND, Denmark")
            } as Location,
            timeOfArrival: "09:00",
            groups: [null, null],
            pendingGroups: [],
        } as CalendarDay,
    } as Record<string, CalendarDay>,
} as Week;

const mockUser: User = {
    id: 0,
    firstName: "User",
    lastName: "Zero",
    phoneNumber: "12345678",
    editedCalendarWeeks: [],
    lookingForGroups: false,
    driverInGroups: [],
    passengerInGroups: [],
    schedule: mockSchedule,

    calendar: {
        [weekNumber]: structuredClone(mockSchedule),
    } as Calendar,
} as User;

const newMockUser = (
    id: number,
    firstName: string,
    lastName: string,
    address: string,
    TOAs: string[],
    driver: boolean,
) => {
    const newMockUser: User = structuredClone(mockUser);

    newMockUser.id = id;
    newMockUser.firstName = firstName;
    newMockUser.lastName = lastName;

    Object.values(newMockUser.schedule.days).forEach(async (day, index) => {
        day.carAvailability = driver ? true : false;
        day.seatsOffered = driver ? 4 : 0;

        day.pickupPoint.address = address;
        // day.pickupPoint.coordinates = await addressToCoordinates(address);

        day.timeOfArrival = TOAs[index];
    });

    const scheduleClone: Week = structuredClone(newMockUser.schedule);

    newMockUser.calendar[weekNumber] = scheduleClone;

    return newMockUser;
};

mockUsers.set(0, mockUser);
mockUsers.set(
    1,
    newMockUser(
        1,
        "User",
        "One",
        "Duathlonstien, Svenstrup, ND, Denmark",
        ["09:00", "09:00", "09:00", "09:00", "09:00"],
        true,
    ),
);
mockUsers.set(
    2,
    newMockUser(
        2,
        "User",
        "Two",
        "Hobrovej, Aalborg, ND, Denmark",
        ["09:00", "09:00", "09:00", "09:00", "09:00"],
        true,
    ),
);
mockUsers.set(
    3,
    newMockUser(
        3,
        "User",
        "Three",
        "Over Kæret, Aalborg, ND, Denmark",
        ["09:00", "09:00", "09:00", "09:00", "09:00"],
        true,
    ),
);
mockUsers.set(
    4,
    newMockUser(
        4,
        "User",
        "Four",
        "Universitetskorridoren, Aalborg, ND, Denmark",
        ["09:00", "09:00", "09:00", "09:00", "09:00"],
        false,
    ),
);

// mockUsers.forEach((user) => {
//     console.log(JSON.stringify(user, null, 2));
// })

// await findEligbleDrivers(mockUsers.get(4) as User, mockUsers);
// console.log("hello")

describe("Find Eligble Drivers", () => {
    test("Basic test. 4 Drivers, 1 Passenger With The Same TOAs", async () => {
        expect(
            await findEligbleDrivers(mockUsers.get(4) as User, mockUsers),
        ).toStrictEqual({
            weeks: {
                "23": {
                    Monday: {
                        "0": 1,
                        "1": 1,
                        "2": 1,
                        "3": 1,
                    },
                    Tuesday: {
                        "0": 1,
                        "1": 1,
                        "2": 1,
                        "3": 1,
                    },
                    Wednesday: {
                        "0": 1,
                        "1": 1,
                        "2": 1,
                        "3": 1,
                    },
                    Thursday: {
                        "0": 1,
                        "1": 1,
                        "2": 1,
                        "3": 1,
                    },
                    Friday: {
                        "0": 1,
                        "1": 1,
                        "2": 1,
                        "3": 1,
                    },
                },
            },
            accumulator: {
                "0": 5,
                "1": 5,
                "2": 5,
                "3": 5,
            },
            sortedAccumulator: [
                {
                    id: 0,
                    score: 5,
                },
                {
                    id: 1,
                    score: 5,
                },
                {
                    id: 2,
                    score: 5,
                },
                {
                    id: 3,
                    score: 5,
                },
            ],
        });
    });

    test('"Random" TOAs', async () => {
        mockUsers.set(
            0,
            newMockUser(
                0,
                "User",
                "Zero",
                "Stendyssen 123, Svenstrup, ND, Denmark",
                ["08:30", "08:00", "09:00", "08:45", "08:35"],
                true,
            ),
        );
        mockUsers.set(
            1,
            newMockUser(
                1,
                "User",
                "One",
                "Duathlonstien, Svenstrup, ND, Denmark",
                ["08:35", "08:30", "09:00", "08:45", "09:00"],
                true,
            ),
        );
        mockUsers.set(
            2,
            newMockUser(
                2,
                "User",
                "Two",
                "Hobrovej, Aalborg, ND, Denmark",
                ["09:00", "08:50", "08:55", "08:35", "08:45"],
                true,
            ),
        );
        mockUsers.set(
            3,
            newMockUser(
                3,
                "User",
                "Three",
                "Over Kæret, Aalborg, ND, Denmark",
                ["08:55", "09:00", "08:45", "08:50", "08:30"],
                true,
            ),
        );
        mockUsers.set(
            4,
            newMockUser(
                4,
                "User",
                "Four",
                "Universitetskorridoren, Aalborg, ND, Denmark",
                ["09:00", "09:00", "09:00", "09:00", "09:00"],
                false,
            ),
        );

        const result = await findEligbleDrivers(
            mockUsers.get(4) as User,
            mockUsers,
        );

        // expect(result.weeks[weekNumber].Monday["0"]).toBeCloseTo(0, 8);
        // expect(result.weeks[weekNumber].Tuesday["0"]).toBeCloseTo(0, 8);
        expect(result.weeks[weekNumber].Wednesday["0"]).toBeCloseTo(1, 8);
        expect(result.weeks[weekNumber].Thursday["0"]).toBeCloseTo(1 / 2, 8);
        expect(result.weeks[weekNumber].Friday["0"]).toBeCloseTo(1 / 6, 8);

        expect(result.weeks[weekNumber].Monday["1"]).toBeCloseTo(1 / 6, 8);
        // expect(result.weeks[weekNumber].Tuesday["1"]).toBeCloseTo(0, 8);
        expect(result.weeks[weekNumber].Wednesday["1"]).toBeCloseTo(1, 8);
        expect(result.weeks[weekNumber].Thursday["1"]).toBeCloseTo(1 / 2, 8);
        expect(result.weeks[weekNumber].Friday["1"]).toBeCloseTo(1, 8);

        expect(result.weeks[weekNumber].Monday["2"]).toBeCloseTo(1, 8);
        expect(result.weeks[weekNumber].Tuesday["2"]).toBeCloseTo(2 / 3, 8);
        expect(result.weeks[weekNumber].Wednesday["2"]).toBeCloseTo(5 / 6, 8);
        expect(result.weeks[weekNumber].Thursday["2"]).toBeCloseTo(1 / 6, 8);
        expect(result.weeks[weekNumber].Friday["2"]).toBeCloseTo(1 / 2, 8);

        expect(result.weeks[weekNumber].Monday["3"]).toBeCloseTo(5 / 6, 8);
        expect(result.weeks[weekNumber].Tuesday["3"]).toBeCloseTo(1, 8);
        expect(result.weeks[weekNumber].Wednesday["3"]).toBeCloseTo(1 / 2, 8);
        expect(result.weeks[weekNumber].Thursday["3"]).toBeCloseTo(2 / 3, 8);
        // expect(result.weeks[weekNumber].Friday["3"]).toBeCloseTo(0, 8);

        expect(result.accumulator[0]).toBeCloseTo(1 + 1 / 2 + 1 / 6, 8);
        expect(result.accumulator[1]).toBeCloseTo(1 / 6 + 1 + 1 / 2 + 1, 8);
        expect(result.accumulator[2]).toBeCloseTo(
            1 + 2 / 3 + 5 / 6 + 1 / 6 + 1 / 2,
            8,
        );
        expect(result.accumulator[3]).toBeCloseTo(5 / 6 + 1 + 1 / 2 + 2 / 3, 8);

        expect(result.sortedAccumulator).toBeDefined();
        const accumulator = result.sortedAccumulator!;

        expect(accumulator[0].id).toBe(2);
        expect(accumulator[0].score).toBeCloseTo(19 / 6);

        expect(accumulator[1].id).toBe(3);
        expect(accumulator[1].score).toBeCloseTo(3);

        expect(accumulator[2].id).toBe(1);
        expect(accumulator[2].score).toBeCloseTo(8 / 3);

        expect(accumulator[3].id).toBe(0);
        expect(accumulator[3].score).toBeCloseTo(5 / 3);
    });
});
