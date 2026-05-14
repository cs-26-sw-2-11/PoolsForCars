import express, { type NextFunction } from "express";
import * as userModel from '../models/user.model.js';
import type { Week } from '../models/week.model.js';
import type { Location } from "../models/location.model.js";
import * as calendarDayModel from "../models/calendar_day.model.js";
import * as uservices from "./user.service.js";
import { addressToCoordinates } from "./ors.service.js";
import * as calendarModel from "../models/calendar.model.js";
import * as groupService from "./groups/group.service.js";

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
    pickupAddress: string,
    destinationAddress: string,
    timeOfArrival: string
}>


// Helper function to get all users.
export const getUsersService = async () => {
    try {
        const users: userModel.usersJSON = await userModel.readUsersJSON();
        return users
    } catch (err) {
        console.log(err)
    }
}


const createUser = async (user: userModel.User): Promise<userModel.User> => {
    const recievedUser: userModel.User = user;
    try {
        const currentDate: Date = new Date();
        const currentWeek: number = await calendarModel.dateToWeek(currentDate);

        recievedUser.schedule.startDate = await calendarModel.getFirstDayOfWeek(currentDate);
        recievedUser.schedule.endDate = await calendarModel.getLastWorkdayOfWeek(currentDate);

        const tempDate: Date = new Date(recievedUser.schedule.startDate.valueOf());
        for (const dayEntry of Object.entries(recievedUser.schedule.days)) {
            // set the correct dates for the week
            dayEntry[1].date = new Date(tempDate.valueOf());
            tempDate.setDate(tempDate.getDate() + 1);
        }

        recievedUser.calendar[currentWeek] = JSON.parse(JSON.stringify(recievedUser.schedule)); // Copy the users schedule into its calendar under the current week

        return await userModel.createUser(recievedUser); // Create a new user in the database
    } catch (err) {
        console.log(err);
        throw err;
    }
}

// Handles logins
export const loginHandler = async (req: express.Request) => {
    try {
        // Gets the "sanitized" last name and phone number
        let { lastName, phone } = req.body;
        // Loads all the users, using an asynchronous function
        const users = await uservices.getUsersService();
        // Returns early if database is unpopulated.
        if (!users) return -1;
        // Sorts through all the users, using the object from the key value paired users, since the user is the value.
        for (const [key, value] of Object.entries(users)) {
            if (value.lastName === lastName && value.phoneNumber === phone) {
                // Return the user id, if the user exists in the database.
                return value.id;
            }
        }
        // Returns -1, an id not found in the database, if login doesnt match an user.
        return -1;
    } catch (err) {
        console.log(err)
        return -1;
    }
};

// Unpack and reformat preferences
export const unpackUser = async (req: express.Request) => {
    const { firstName, lastName, phoneNumber, preferences } = req.body

    // Initiates the week
    let schedule: Week = {
        startDate: startDate,
        endDate: startDate,
        days: {},
    };
             
    // Loads preferences into a custom object, so it is easier to get the data from it
    // Has the same format as our known faker, so the information mirrors what we've been building with
    const userPreferences: userPreferences = preferences as userPreferences
    for (const day of Object.entries(userPreferences)) {
        schedule.days[day[1].day] = {
            date: startDate,
            carAvailability: day[1].carAvailability,
            seatsOffered: day[1].seatsOffered,
            carpoolingIntent: day[1].carpoolingIntent,
            pickupPoint: {
                address: day[1].pickupAddress,
                coordinates: await addressToCoordinates(day[1].pickupAddress),
            } as Location,
            destination: {
                address: day[1].destinationAddress,
                coordinates: await addressToCoordinates(day[1].destinationAddress),
            } as Location,
            timeOfArrival: day[1].timeOfArrival,
            groups: [null, null],
            pendingGroups: [],
        };
    }

    // Returns the value in the format known in the user interface.
    return {
        id: 0,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        schedule: schedule,
        calendar: {},
        editedCalendarWeeks: [],
        lookingForGroups: false,
        driverInGroups: [],
        passengerInGroups: [],
    } as userModel.User;

}

// The actual called function responsible for the signup
export const doSignup = async (req: express.Request) => {
    // Unpacks all the information send through the form found on the signup page.
    const user: userModel.User = await unpackUser(req);

    const newUser: userModel.User = await createUser(user);

    console.log("finished geocoding");

    newUser.driverInGroups = await groupService.makeNewGroups(user);

    console.log("finished making groups");

    userModel.updateUser(newUser.id, newUser);

    // Needs to do something to let the user know their profile has been created.
}
