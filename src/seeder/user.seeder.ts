import { fakerDA as faker } from '@faker-js/faker';
import { User } from '../models/user.model.js';
import type { CalenderDay } from '../models/calender_day.model.js';

faker.seed(69420);


let idCounter = 17;
let weekDays: [string, string, string, string, string] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function createRandomUser(): User {
    let calender: CalenderDay[] = [];
    let calenderDay: CalenderDay;

    for (let i = 0; i < 5; i++)
        calenderDay = {
            day: String(weekDays[i]),
            date: String(faker.date.soon),
            carAvailability: faker.datatype.boolean(),
            seatsOffered: faker.number.int({min: 1, max: 4}),
            carpoolingIntent: true,
            pickupPoint: {
                address: String(faker.location.streetAddress),
                coordinates: [Number(faker.location.latitude), Number(faker.location.latitude)]
            },
            destination: {
                address: String(faker.location.streetAddress),
                coordinates: [Number(faker.location.latitude), Number(faker.location.latitude)]
            },
            timeOfArrival: "hello",
        }
}
return {
    id: idCounter++,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    phoneNumber: faker.phone.number({ style: "national" }),
    calender: {

    }
};
}

export const users = faker.helpers.multiple(createRandomUser, {
    count: 100,
});



console.log(users);
