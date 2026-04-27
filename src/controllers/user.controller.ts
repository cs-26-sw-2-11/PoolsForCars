import express from "express";
import * as userModel from '../models/user.model.js';
import * as uservice from '../services/user.service.js'
import { warn } from "console";


// ───────────────────────────────────────────────────────────────
//  :::::: MAIN CRUD FUNCTIONS ::::::
// ───────────────────────────────────────────────────────────────
// Creates the user
export const createUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const user: userModel.User = await userModel.createUser(req.body as userModel.User); // Create a new user in the database
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

// Delete a user, by finding them using their id
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

// LOGIN Handling
export const loginHandling = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
   const user = await uservice.loginHandler(req)
   if (Number(user)===-1){
    console.log("user doesnt match");
   } else{
    console.log(`The users ID is ${user}`);
   }
}

export const enableGroupSearching = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.send("NOT YET IMPLEMENTED");
}

export const disableGroupSearching = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(200);
}


// ───────────────────────────────────────────────────────────────
