import express from "express";
import * as userModel from '../models/user.model.js';
import * as uservice from '../services/user.service.js'
import * as calendarModel from '../models/calendar.model.js';


// ───────────────────────────────────────────────────────────────
//  :::::: MAIN CRUD FUNCTIONS ::::::
// ───────────────────────────────────────────────────────────────
// Creates the user
export const createUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const recievedUser: userModel.User = req.body as userModel.User; // Recieve user object and convert it to User type

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

        const user: userModel.User = await userModel.createUser(recievedUser); // Create a new user in the database

        res.status(200).json(user);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error creating a user' });
    }
}

// Gets all user from the database
export const getUsers = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const users: userModel.usersJSON = await userModel.readUsersJSON();
    res.status(200).json(users);
}

// Get a specific user, using their id
export const getUserById = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log(req.params);
    const user: userModel.User = await userModel.readUser(Number(req.params['userId']));
    res.status(200).json(user);
    // res.send(`NOT YET IMPLEMENTED, getUserById ${req.params}`);
}

// export const updateUsers = async (req: express.Request, res: express.Response, next: express.NextFunction) => {}

// Update a specific user, by finding them using their id
export const updateUserById = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        console.log(JSON.stringify(req.body, null, 2));
        let user: userModel.User = await userModel.readUser(Number(req.params['userId']));
        const { firstName, lastName, phoneNumber, lookingForGroups, schedule } = req.body;
        user.firstName = firstName;
        user.lastName = lastName;
        user.phoneNumber = phoneNumber;
        user.lookingForGroups = lookingForGroups;
        user.schedule = schedule;

        for (const weekNumber in user.calendar) {
            if (user.editedCalendarWeeks.find((week) => week === Number(weekNumber))) continue;
            user.calendar[weekNumber] = JSON.parse(JSON.stringify(user.schedule));
        }

        userModel.updateUser(Number(req.params['userId']), user);
        res.status(200).json(user);
    } catch (err) {
        console.log(err);
    }
}


//export const deleteUsers = async (req: express.Request, res: express.Response, next: express.NextFunction) => {res.send("NOT YET IMPLEMENTED");}

// Delete a user, by finding them using their id
export const deleteUserById = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        userModel.deleteUser(Number(req.params['userId']));
        let user: userModel.User = await userModel.readUser(Number(req.params['userId']));
        if (typeof user === "undefined") {
            res.status(200).json("Deletion Successful");
        } else {
            res.status(500).json("Couldn't delete user");
        }
    } catch (err) {

        //console.log(err)
    }
}

// ───────────────────────────────────────────────────────────────



// ───────────────────────────────────────────────────────────────
//  :::::: MISCELLANEOUS ::::::
// ───────────────────────────────────────────────────────────────

// LOGIN Handling
export const loginHandling = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const userId = await uservice.loginHandler(req)
        if (Number(userId) === -1) {
            res.status(401).json("Couldn't match user credentials");
        } else {
            res.status(200).json({ message: "User credentials found", id: userId, redirect: "/calendar" });
        }
    } catch (err) {
        next(err);
    }
}

export const enableGroupSearching = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.send("NOT YET IMPLEMENTED");
}

export const disableGroupSearching = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(200);
}


// ───────────────────────────────────────────────────────────────
