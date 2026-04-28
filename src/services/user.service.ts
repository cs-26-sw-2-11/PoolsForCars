import express from "express";
import * as userModel from '../models/user.model.js';
import * as controller from "../controllers/user.controller.js"
import type { Week } from '../models/week.model.js';
import type { Location } from "../models/location.model.js";
import type { CalendarDay } from "../models/calendar_day.model.js";
import { createUser } from "../models/user.model.js";

const startDate: Date = new Date();
const weekDays: [string, string, string, string, string] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const centerLocation: Location = {
    address: "Fibigerstræde 15, 9220 Aalborg",
    coordinates: [57.0161, 9.97759]
}

type userPreferences = Record<string, {
    day: string, 
    carAvailability: boolean, 
    seatsOffered: number, 
    carpoolingIntent: boolean, 
    pickupPoint:{address: string, coordinates:number[]},
    destination:{address: string, coordinates:number[]},
    timeOfArrival: string
}>


// Get all users
export const getUsersService = async () => {
    const users: userModel.usersJSON = await userModel.readUsersJSON();
    return users
}

export const loginHandler = async (req: express.Request) => {
    let { lastName, phone } = req.body;
    const users = await getUsersService();
    Object.entries(users);
    for (const [key, value] of Object.entries(users)) {
        if(value.lastName === lastName && value.phoneNumber === phone){
            return value.id;
        }
    }
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

    // Loads preferences into a custom object, so it is easier to get the data from it.
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



export const doSignup = async (req: express.Request) => {
    const user:userModel.User = await unpackUser(req);
    const user2:userModel.User = await userModel.readUser(0);
    createUser(user);
}
