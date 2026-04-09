import { fakerDA as faker } from '@faker-js/faker';
import type { User } from '../models/user.model.js';
import type { CalenderDay } from '../models/calender_day.model.js';

faker.seed(69420);


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
                coordinates: [Number(faker.location.latitude()), Number(faker.location.latitude())]
            },
            destination: {
                address: String(faker.location.streetAddress()),
                coordinates: [Number(faker.location.latitude()), Number(faker.location.latitude())]
            },
            timeOfArrival: String(faker.date.soon()),
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
