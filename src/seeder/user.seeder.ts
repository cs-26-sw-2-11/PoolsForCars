import { fakerDA as faker } from '@faker-js/faker';
import type { User } from '../models/user.model.js';
import type { CalenderDay } from '../models/calender_day.model.js';
import type { Location } from '../models/location.model.js';

import { createUser } from '../models/user.model.js';


// ───────────────────────────────────────────────────────────────
//  :::::: SEEDING CONTROL PANEL ::::::
// ───────────────────────────────────────────────────────────────

// Set the seed for the seeder - same seed will always generate same result.
faker.seed(69420);

// Set the centerLocation which will be the destination for all users.
let centerLocation: Location = {
    address: "Fibigerstræde 15, 9220 Aalborg",
    coordinates: [57.0161, 9.97759],
}

// Set the coordinate deviation for origin points.
let d: number = 0.011192;

// Set the time interval
let hourTimes: string[] = ["08", "09"];
let minuteTimes: string[] = ["00", "15", "30", "45"];



// ───────────────────────────────────────────────────────────────



let idCounter = 0;
let weekDays: [string, string, string, string, string] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];


export function createRandomUser(): User {
    let calender: CalenderDay[] = [];
    for (let i = 0; i < 5; i++) {
        let calenderDay: CalenderDay = {
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
                    }))]
            },
            destination: centerLocation,
            timeOfArrival: (() => {
                const hour: number = faker.number.int({ min: 0, max: hourTimes.length - 1 });
                const minute: number = faker.number.int({ min: 0, max: minuteTimes.length - 1 });
                return `${hourTimes[hour]}:${minuteTimes[minute]}`;
            })()
        }

        calender.push(calenderDay);
    }

    return {
        id: idCounter++,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phoneNumber: faker.phone.number({ style: "national" }),
        calender: calender,
    }
};

export const users = faker.helpers.multiple(createRandomUser, {
    count: 2,
});



import { OpenRouteService } from "ors-client";

import dotenv from 'dotenv';
dotenv.config();



const client = new OpenRouteService({
    apiKey: process.env.ORS_API_KEY || "",
});

async function geocodingExamples() {
    try {
        users.forEach(user => {
            geocode(user);
        });

    } catch (error) {
        console.error("Error:", error);
    }
}


async function geocode(user: User) {
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


console.log(JSON.stringify(users, null, 4));
// geocodingExamples();

users.forEach(user => {
    createUser(user);
});
