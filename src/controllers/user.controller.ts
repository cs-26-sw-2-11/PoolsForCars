import express from "express";
import * as userModel from "../models/user.model.js";
import * as uservice from "../services/users/user.service.js";
import * as calendarModel from "../models/calendar.model.js";

// ──────────────────────────────────────────────────────────────────
//  :::::: MAIN CRUD FUNCTIONS :::::: ## NEEDS TO BE REFACTORED ##
// ──────────────────────────────────────────────────────────────────

// Signup. i.e. (Create User)
export const signUp = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
) => {
    try {
        const success: uservice.signUpResult = await uservice.doSignup(
            req.body.firstName,
            req.body.lastName,
            req.body.phoneNumber,
            req.body.preferences,
        );
        if (success === "User_Created") {
            // Needs to call controller for group handling
            res.status(200).json({
                redirect: "/login",
            });
        } else if (success === "Phone_Number_Taken") {
            res.status(401).json({
                message: "Phone number is taken"
            });
        }
    } catch (err) {
        res.status(400).json({
            message: String(err)
        });
    }
};

// Update a specific user, by finding them using their id
export const updateUserById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
) => {
    try {
        //const { firstName, lastName, phoneNumber, lookingForGroups } = req.body
        const success: boolean = await uservice.updateUserInfoById(
            req.body.firstName,
            req.body.lastName,
            req.body.phoneNumber,
            req.body.lookingForGroups,
            req.params["userId"] as string,
        );
        if (success === true) {
            res.status(200).json("User updated successfully");
        } else {
            res.status(401).json("Something went wrong");
        }
    } catch (err) {
        next(err);
    }
};

// Delete a user, by finding them using their id
export const deleteUserById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
) => {
    try {
        userModel.deleteUser(Number(req.params["userId"]));
        let user: userModel.User = userModel.readUser(
            Number(req.params["userId"]),
        );
        if (typeof user === "undefined") {
            res.status(200).json("Deletion Successful");
        } else {
            res.status(500).json("Couldn't delete user");
        }
    } catch (err) {
        next(err);
        //console.log(err)
    }
};

// Gets all user from the database
export const getUsers = async (
    req: express.Request,
    res: express.Response,
) => {
    const users: userModel.usersJSON = userModel.readUsersJSON();
    res.status(200).json(users);
};

// Get a specific user, using their id
export const getUserById = async (
    req: express.Request,
    res: express.Response,
) => {
    const user: userModel.User = userModel.readUser(
        Number(req.params["userId"]),
    );
    res.status(200).json(user);
};

// export const updateUsers = async (req: express.Request, res: express.Response, next: express.NextFunction) => {}

// ───────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────
//  :::::: MISCELLANEOUS ::::::
// ───────────────────────────────────────────────────────────────

// Login i.e. (kinda Read user)
export const loginHandler = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
) => {
    try {
        const result = await uservice.loginService(
            req.body.lastName,
            req.body.phoneNumber,
        );
        if (!result.success) {
            res.status(401).json({
                message: "Couldn't match user credentials",
            });
        } else {
            //console.log("user credentials found");
            res.status(200).json({
                message: "User credentials found",
                id: result.userId,
                redirect: "/home",
            });
        }
    } catch (err) {
        next(err);
    }
};

export const enableGroupSearching = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
) => {
    res.send("NOT YET IMPLEMENTED");
};

export const disableGroupSearching = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
) => {
    res.status(200);
};

// ───────────────────────────────────────────────────────────────
