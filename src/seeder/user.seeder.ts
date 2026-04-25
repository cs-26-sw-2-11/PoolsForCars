import { fakerDA as faker } from '@faker-js/faker';
import type { User, Users } from '../models/user.model.js';
import { clearUsers, deleteUser, initUsers } from '../models/user.model.js';
import type { CalendarDay } from '../models/calendar_day.model.js';
import type { Location } from '../models/location.model.js';

import type { Week } from '../models/week.model.js';
import { createUser, readUsers } from '../models/user.model.js';

import { OpenRouteService } from "ors-client";

import dotenv from 'dotenv';

// ───────────────────────────────────────────────────────────────
//  :::::: SEEDING CONTROL PANEL ::::::
// ───────────────────────────────────────────────────────────────

// Set the seed for the seeder - same seed will always generate same result.
faker.seed(69420);

// Users to create when running the script directly
const fakeUsers = 5;

// Set the centerLocation which will be the destination for all users.
const centerLocation: Location = {
    address: "Fibigerstræde 15, 9220 Aalborg",
    coordinates: [57.0161, 9.97759]
}
// Set the coordinate deviation for origin points.
const d: number = 0.011192;

// Set the time interval
const hourTimes: string[] = ["08", "09"];
const minuteTimes: string[] = ["00", "15", "30", "45"];

const startDate: Date = new Date();

let idCounter = 0;
const weekDays: [string, string, string, string, string] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];


// ───────────────────────────────────────────────────────────────



// ───────────────────────────────────────────────────────────────
//  :::::: USER GENERATION ::::::
// ───────────────────────────────────────────────────────────────

export const createRandomUser = async (): Promise<User> => {
    // create the default schedule, used to initialize new weeks
    let schedule: Week = {
        startDate: startDate,
        endDate: startDate,
        days: {}
    };

    // run through all the specified days in 'weekDays' array
    weekDays.forEach(day => {
        // create a new key, value pair as a record in schedule.days
        schedule.days[day] = {
            date: startDate,
            carAvailability: faker.datatype.boolean(),
            seatsOffered: faker.number.int({ min: 1, max: 4 }),
            carpoolingIntent: /*faker.datatype.boolean()*/ true,
            pickupPoint: {
                address: String(faker.location.streetAddress()),
                coordinates: [
                    Number(faker.location.latitude({
                        min: centerLocation.coordinates[0] - d,
                        max: centerLocation.coordinates[0] + d
                    })),
                    Number(faker.location.latitude({
                        min: centerLocation.coordinates[1] - d,
                        max: centerLocation.coordinates[1] + d
                    }))]
            } as Location,
            destination: centerLocation,
            timeOfArrival: (() => {
                const hour: number = faker.number.int({ min: 0, max: hourTimes.length - 1 });
                const minute: number = faker.number.int({ min: 0, max: minuteTimes.length - 1 });
                return `${hourTimes[hour]}:${minuteTimes[minute]}`;
            })(),
            groups: [null, null],
        } as CalendarDay;
    });

    return {
        id: idCounter++,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phoneNumber: faker.phone.number({ style: "national" }),
        schedule: schedule,
        calendar: {},
        lookingForGroups: false,
        groups: [],

    };
};

export const createRandomUsers = async (amount: number): Promise<User[]> => {
    const promises: Promise<User>[] = faker.helpers.multiple(createRandomUser, { count: amount });
    return await Promise.all(promises);
};

export const clearAndFakeUsers = async () => {
    await clearUsers();

    await initUsers();

    const before = new Date();


    const users: User[] = await createRandomUsers(fakeUsers);

    await Promise.all(
        users.map(user => {
            return createUser(user)
        }));

    const after = new Date();

    console.log(`Creating ${fakeUsers} users took ` + String(after.getTime() - before.getTime()) + " milliseconds");
}






















// dotenv.config();
//
//
//
// const client = new OpenRouteService({
//     apiKey: process.env.ORS_API_KEY || "",
// });


// async function geocode(user: User) {
//     const searchResults = await client.geocoding.search({
//         // text: "Fibigerstræde 15, 9220 Aalborg",
//         text: String(user.calendar[0]?.days[0].pickupPoint.address),
//         // size: 5,
//         // layers: ["address", "country"],
//         // "focus.point": [57.012186, 9.992092],
//         // "boundary.circle": [57.012186, 9.992092, 1],
//         // "focus.point": [9.992092, 57.012186],
//         // "boundary.circle": [9.992092, 57.012186, 1],
//         // "boundary.country": ["DK"]
//     });
//
//     console.log("Search results:", searchResults.features.length);
//     searchResults.features.forEach((feature, index) => {
//         console.log(`Result: ${index}`, feature.properties);
//         console.log(`Result: ${index}`, feature.geometry);
//     });
//
// }
//
