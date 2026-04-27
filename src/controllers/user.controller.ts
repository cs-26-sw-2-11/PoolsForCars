import express from "express";
import * as userModel from '../models/user.model.js';
import * as calendarModel from '../models/calendar.model.js';
import * as calendarDayModel from "../models/calendar_day.model.js";
import * as groupModel from "../models/group.model.js";


// ───────────────────────────────────────────────────────────────
//  :::::: MAIN CRUD FUNCTIONS ::::::
// ───────────────────────────────────────────────────────────────

export const createUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const recievedUser: userModel.User = req.body as userModel.User; // Recieve user object and convert it to User type

        const currentDate: Date = new Date();
        recievedUser.schedule.startDate = await calendarModel.getFirstDayOfWeek(currentDate);
        recievedUser.schedule.endDate   = await calendarModel.getLastWorkdayOfWeek(currentDate);

        const tempDate: Date = new Date(recievedUser.schedule.startDate.valueOf());
        for (const dayEntry of Object.entries(recievedUser.schedule.days)) {
            let day: calendarDayModel.CalendarDay = dayEntry[1];
            // set the correct dates for the week
            day.date = new Date(tempDate.valueOf());
            tempDate.setDate(tempDate.getDate() + 1);
        }

        recievedUser.calendar[await calendarModel.dateToWeek(currentDate)] = JSON.parse(JSON.stringify(recievedUser.schedule)); // Copy the users schedule into its calendar under the current week

        const user: userModel.User = await userModel.createUser(recievedUser); // Create a new user in the database

        res.status(200).json(user);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error creating a user' });
    }
}

export const getUsers = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const users: userModel.usersJSON = await userModel.readUsersJSON();
    res.status(200).json(users);
}

export const getUserById = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user: userModel.User = await userModel.readUser(Number(req.params['userId']));
    res.status(200).json(user);
    // res.send(`NOT YET IMPLEMENTED, getUserById ${req.params}`);
}

// export const updateUsers = async (req: express.Request, res: express.Response, next: express.NextFunction) => {}

export const updateUserById = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try{
        let user: userModel.User = await userModel.readUser(Number(req.params['userId']));
        const { firstName, lastName, phoneNumber, lookingForGroups } = req.body;
        user.firstName = firstName;
        user.lastName = lastName;
        user.phoneNumber = phoneNumber;
        user.lookingForGroups = lookingForGroups;
        userModel.updateUser(Number(req.params['userId']), user);
        res.status(200).json(user);
    } catch(err){
        console.log(err);
    }
}


//export const deleteUsers = async (req: express.Request, res: express.Response, next: express.NextFunction) => {res.send("NOT YET IMPLEMENTED");}

export const deleteUserById = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try{
        userModel.deleteUser(Number(req.params['userId']));
        let user: userModel.User = await userModel.readUser(Number(req.params['userId']));
        if(typeof user === "undefined"){
            res.status(200).json("Deletion Successful");
        }else {
            res.status(500).json("Couldn't delete user");
        }
    } catch(err){
        console.log(err)
    }
}

// ───────────────────────────────────────────────────────────────



// ───────────────────────────────────────────────────────────────
//  :::::: MISCELLANEOUS ::::::
// ───────────────────────────────────────────────────────────────

// LOGIN VERIFICATION


export const enableGroupSearching = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.send("NOT YET IMPLEMENTED");
}

export const disableGroupSearching = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(200);
}

// ───────────────────────────────────────────────────────────────
