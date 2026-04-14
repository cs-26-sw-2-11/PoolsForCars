import { fakerDA as faker } from '@faker-js/faker';
import { createUser } from '../models/user.model.js';
// ───────────────────────────────────────────────────────────────
//  :::::: SEEDING CONTROL PANEL ::::::
// ───────────────────────────────────────────────────────────────
// Set the seed for the seeder - same seed will always generate same result.
faker.seed(69420);
// Users to create
const fakeUsers = 1000;
// Set the centerLocation which will be the destination for all users.
const centerLocation = {
    address: "Fibigerstræde 15, 9220 Aalborg",
    coordinates: [57.0161, 9.97759],
};
// Set the coordinate deviation for origin points.
const d = 0.011192;
// Set the time interval
const hourTimes = ["08", "09"];
const minuteTimes = ["00", "15", "30", "45"];
// ───────────────────────────────────────────────────────────────
let idCounter = 0;
const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export function createRandomUser() {
    let calender = [];
    for (let i = 0; i < 5; i++) {
        let calenderDay = {
            day: String(weekDays[i]),
            date: String(faker.date.soon()),
            carAvailability: faker.datatype.boolean(),
            seatsOffered: faker.number.int({ min: 1, max: 4 }),
            carpoolingIntent: true,
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
                    }))
                ]
            },
            destination: centerLocation,
            timeOfArrival: (() => {
                const hour = faker.number.int({ min: 0, max: hourTimes.length - 1 });
                const minute = faker.number.int({ min: 0, max: minuteTimes.length - 1 });
                return `${hourTimes[hour]}:${minuteTimes[minute]}`;
            })()
        };
        calender.push(calenderDay);
    }
    return {
        id: idCounter++,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phoneNumber: faker.phone.number({ style: "national" }),
        calender: calender,
    };
}
;
export const users = faker.helpers.multiple(createRandomUser, {
    count: fakeUsers,
});
import { OpenRouteService } from "ors-client";
import dotenv from 'dotenv';
import { readUsers } from '../models/users.model.js';
import { time } from 'node:console';
dotenv.config();
const client = new OpenRouteService({
    apiKey: process.env.ORS_API_KEY || "",
});
async function geocodingExamples() {
    try {
        users.forEach(user => {
            geocode(user);
        });
    }
    catch (error) {
        console.error("Error:", error);
    }
}
async function geocode(user) {
    const searchResults = await client.geocoding.search({
        // text: "Fibigerstræde 15, 9220 Aalborg",
        text: String(user.calender[0]?.pickupPoint.address),
        // size: 5,
        // layers: ["address", "country"],
        // "focus.point": [57.012186, 9.992092],
        // "boundary.circle": [57.012186, 9.992092, 1],
        // "focus.point": [9.992092, 57.012186],
        // "boundary.circle": [9.992092, 57.012186, 1],
        // "boundary.country": ["DK"]
    });
    console.log("Search results:", searchResults.features.length);
    searchResults.features.forEach((feature, index) => {
        console.log(`Result: ${index}`, feature.properties);
        console.log(`Result: ${index}`, feature.geometry);
    });
}
// geocodingExamples();
const before = new Date();
for (const user of users) {
    await createUser(user);
    // console.log(user.id);
}
const after = new Date();
console.log(`Creating ${fakeUsers} users took ` + String(after.getTime() - before.getTime()) + " milliseconds");
//# sourceMappingURL=user.seeder.js.map