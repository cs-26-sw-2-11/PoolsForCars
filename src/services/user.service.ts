import express, { type NextFunction } from "express";
import * as userModel from '../models/user.model.js';
import type { Week } from '../models/week.model.js';
import type { Location } from "../models/location.model.js";
import type { CalendarDay } from "../models/calendar_day.model.js";
import { createUser } from "../models/user.model.js";
import * as uservices from "./user.service.js";

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
    if (!users) throw new Error ("db error");
    return users;

}

// Handles logins
export const loginHandler = async (req: express.Request) => {
    try{
        // Gets the "sanitized" last name and phone number
        let { lastName, phoneNumber } = req.body;
        //console.log(`${lastName} and ${phoneNumber}`);
        // Loads all the users, using an asynchronous function
        const users = await uservices.getUsersService();
        // Returns early if database is unpopulated.
        if (!users) return -2;
        
        // Sorts through all the users, using the object from the key value paired users, since the user is the value.
        for (const [key, value] of Object.entries(users)) {
            if(value.lastName === lastName && value.phoneNumber === phoneNumber){
                //console.log(value.id)
                // Return the user id, if the user exists in the database.
                return value.id as number;
            }
        }
        // Returns -1, an id not found in the database, if login doesnt match an user.
        return -1;
    } catch(err){
        console.log(err);
        return -2;
    }      
};

// Unpack and reformat preferences
export const unpackUser = async (req: express.Request): Promise<userModel.User> => {
        const { firstName, lastName, phoneNumber, preferences } = req.body;
        const userPreferences:userPreferences = preferences as userPreferences;
        if(!firstName || !lastName || !phoneNumber || !preferences){
            throw new Error ("invalid user data");
        };

        // Initiates the week
        let schedule: Week = {
                startDate: startDate,
                endDate: startDate,
                days: {}
            };

        // Loads preferences into a custom object, so it is easier to get the data from it
        // Has the same format as our known faker, so the information mirrors what we've been building with

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
            driverInGroups: [],
            passengerInGroups: [],
        } as userModel.User;
}

export const doUserExist = async (user: userModel.User) => {
    const allUsers = await uservices.getUsersService();
    // Returns early if database is unpopulated.
    for (const [key, value] of Object.entries(allUsers)) {
        if(value.lastName === user.lastName && value.phoneNumber === user.phoneNumber && value.firstName === user.firstName){
            return true;
        }
    }
    return false;
}

// The actual called function responsible for the signup
export const doSignup = async (req: express.Request) => {
    // Unpacks all the information send through the form found on the signup page.
    const user:userModel.User = await uservices.unpackUser(req);
    const exists: boolean = await uservices.doUserExist(user);
    if(exists === false) {
        await createUser(user);
        return true;
    } else {
        return false;
    }
    // Needs to do something to let the user know their profile has been created.
}

export const updateUserInfoById = async (req: express.Request) => {
    let user: userModel.User = await userModel.readUser(Number(req.params['userId']));
    const oldUser: userModel.User = user;
    const { firstName, lastName, phoneNumber, lookingForGroups } = req.body;
    if(!firstName || !lastName || !phoneNumber || !lookingForGroups) throw new Error("Couldn't get data")
    user.firstName = firstName;
    user.lastName = lastName;
    user.phoneNumber = phoneNumber;
    user.lookingForGroups = lookingForGroups;
    if(user.firstName === oldUser.firstName && user.lastName === oldUser.lastName && user.phoneNumber === oldUser.phoneNumber && user.lookingForGroups === oldUser.lookingForGroups){
        return -1;
    }else {
    userModel.updateUser(Number(req.params['userId']), user);
    return 1;
    };
}
