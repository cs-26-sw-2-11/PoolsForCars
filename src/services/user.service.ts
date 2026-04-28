import express from "express";
import * as userModel from '../models/user.model.js';
import type { Week } from '../models/week.model.js';
import type { Location } from "../models/location.model.js";
import type { CalendarDay } from "../models/calendar_day.model.js";
import { createUser } from "../models/user.model.js";


const startDate: Date = new Date();

// Our final destination for all travellers.
const centerLocation: Location = {
    address: "Fibigerstræde 15, 9220 Aalborg",
    coordinates: [57.0161, 9.97759]
}

// Data transfer object, mirroring our user interface
type userPreferences = Record<string, {
    day: string, 
    carAvailability: boolean, 
    seatsOffered: number, 
    carpoolingIntent: boolean, 
    pickupPoint:{address: string, coordinates:number[]},
    destination:{address: string, coordinates:number[]},
    timeOfArrival: string
}>


// Helper function to get all users.
export const getUsersService = async () => {
    const users: userModel.usersJSON = await userModel.readUsersJSON();
    return users
}

// Handles logins
export const loginHandler = async (req: express.Request) => {
    // Gets the "sanitized" last name and phone number
    let { lastName, phone } = req.body;
    // Loads all the users, using an asynchronous function
    const users = await getUsersService();

    // Sorts through all the users, using the object from the key value paired users, since the user is the value.
    Object.entries(users);
    for (const [key, value] of Object.entries(users)) {
        if(value.lastName === lastName && value.phoneNumber === phone){
            // Return the user id, if the user exists in the database.
            return value.id;
        }
    }
    // Returns -1, an id not found in the database, if login doesnt match an user.
    return -1;
}


// Unpack and reformat preferences
export const unpackUser = async (req: express.Request) => {
    const { firstName, lastName, phoneNumber, preferences } = req.body

    // Initiates the week
    let schedule: Week = {
            startDate: startDate,
            endDate: startDate,
            days: {}
        };

    // Loads preferences into a custom object, so it is easier to get the data from it
    // Has the same format as our known faker, so the information mirrors what we've been building with
    const userPreferences:userPreferences = preferences as userPreferences
    for (const day of Object.entries(userPreferences)){
        schedule.days[day[1].day] = {
            carpoolingIntent: day[1].carpoolingIntent,
            date: startDate,
            carAvailability: day[1].carAvailability,
            seatsOffered: day[1].seatsOffered,
            pickupPoint: {
                address: day[1].pickupPoint.address,
                coordinates: day[1].pickupPoint.coordinates,
            } as Location,
            destination: centerLocation,
            timeOfArrival: day[1].timeOfArrival,
            groups: [null, null],
        } as CalendarDay;
    }

    // Returns the value in the format known in the user interface.
    return {
        id: 0,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        schedule: schedule,
        calendar: {},
        lookingForGroups: false,
        groups: [],
    };

}

// The actual called function responsible for the signup
export const doSignup = async (req: express.Request) => {
    // Unpacks all the information send through the form found on the signup page.
    const user:userModel.User = await unpackUser(req);
    createUser(user);
    // Needs to do something to let the user know their profile has been created.
}
