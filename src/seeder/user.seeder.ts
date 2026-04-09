import { fakerDA as faker } from '@faker-js/faker';
import type { User } from '../models/user.model.js';
import type { CalenderDay } from '../models/calender_day.model.js';
import type { Location } from '../models/location.model.js';


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

console.log(JSON.stringify(users, null, 4));
