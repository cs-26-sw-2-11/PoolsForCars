import * as fs from 'fs';

interface Location {
    address: string;
    coordinates: [number, number];
}

interface CalenderDay {
    day: string;
    carAvailability: boolean;
    seatsOffered: number;
    carpoolIntent: boolean;
    pickupPoint: Location;
    destination: Location;
}

interface User {
    firstName: string;
    lastName: string
    phoneNumber: string;
    calender: CalenderDay[];
    pickupRadius: number;
    totalAcceptableDetour: number;
};

let week_days: string[] = ["monday", "tuesday", "wednesday", "thursday", "friday"];




// let users: User[] = [];
// for (let i = 0; i < 5; i++) {
//     let calenderDays: calender_day[] = [];
//     for (let j = 0; j < 5; j++) {
//         let calenderDay: calender_day = {
//             day: `${week_days[j]}`,
//             car_availability: 
//         };
//         calenderDays.push(calenderDay);
//     }
//     let user: user = {name: "john", age: i, calender: calenderDays};
//     users.push(user);
// }
//
// let usersJSON: string = JSON.stringify(users, null, 2);
//
// fs.writeFile('users.json', usersJSON, (err) => {
//     if (err) {
//         console.log('Error writing file:', err);
//     } else {
//         console.log('Successfully wrote file');
//     }
// });
//
