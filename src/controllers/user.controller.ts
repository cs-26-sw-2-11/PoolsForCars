import express from "express";

import * as userModel from '../models/user.model.js';
import { warn } from "console";


// ───────────────────────────────────────────────────────────────
//  :::::: MAIN CRUD FUNCTIONS ::::::
// ───────────────────────────────────────────────────────────────

export const createUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const user: userModel.User = await userModel.createUser(req.body as userModel.User); // Create a new user in the database
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
    console.log(req.params);
    const user: userModel.User = await userModel.readUser(Number(req.params['userId']));
    res.status(200).json(user);
    // res.send(`NOT YET IMPLEMENTED, getUserById ${req.params}`);
}



export const updateUsers = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.send("NOT YET IMPLEMENTED");
}

export const updateUserById = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.send("NOT YET IMPLEMENTED");
}



export const deleteUsers = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.send("NOT YET IMPLEMENTED");
}

export const deleteUserById = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.send("NOT YET IMPLEMENTED");
}

// ───────────────────────────────────────────────────────────────



// ───────────────────────────────────────────────────────────────
//  :::::: MISCELLANEOUS ::::::
// ───────────────────────────────────────────────────────────────


export const enableGroupSearching = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.send("NOT YET IMPLEMENTED");
}

export const disableGroupSearching = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(200);
}


// ───────────────────────────────────────────────────────────────
