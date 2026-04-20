import { fakerDA as faker } from '@faker-js/faker';
import type { User, Users } from '../models/user.model.js';
import { clearUsers, deleteUser, initUsers } from '../models/user.model.js';
import type { CalenderDay } from '../models/calender_day.model.js';
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

// Users to create
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

const startDate: string = new Date().toISOString();



// ───────────────────────────────────────────────────────────────



let idCounter = 0;
const weekDays: [string, string, string, string, string] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];


export function createRandomUser(): User {

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
            carpoolingIntent: faker.datatype.boolean(),
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
            })()
        } as CalenderDay;
    });
    return {
        id: idCounter++,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phoneNumber: faker.phone.number({ style: "national" }),
        schedule: schedule,
        calender: {
            "1": schedule,
        },
        groups: [],

    };
};

export const users = faker.helpers.multiple(createRandomUser, {
    count: fakeUsers,
});



dotenv.config();



const client = new OpenRouteService({
    apiKey: process.env.ORS_API_KEY || "",
});


// async function geocode(user: User) {
//     const searchResults = await client.geocoding.search({
//         // text: "Fibigerstræde 15, 9220 Aalborg",
//         text: String(user.calender[0]?.days[0].pickupPoint.address),
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

// geocodingExamples();

await clearUsers();

await initUsers();

const before = new Date();

// users.forEach(user => {
//     geocode(user);
// });

await Promise.all(
    users.map(user => {
        return createUser(user)
    }));

const after = new Date();

console.log(`Creating ${fakeUsers} users took ` + String(after.getTime() - before.getTime()) + " milliseconds");

const usersRead: Users = await readUsers();

console.log(usersRead);
console.log(usersRead.get(0)?.schedule.days["Monday"]);

// console.log(await readUser(5));
// await deleteUser(6);

// console.log(await readUsers());
