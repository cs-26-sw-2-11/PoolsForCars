import express from "express";
import * as userModel from '../models/user.model.js';
import * as uservice from '../services/user.service.js'
import * as calendarModel from '../models/calendar.model.js';


// ──────────────────────────────────────────────────────────────────
//  :::::: MAIN CRUD FUNCTIONS :::::: ## NEEDS TO BE REFACTORED ##  
// ──────────────────────────────────────────────────────────────────

// Signup. i.e. (Create User)
export const signUp = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try{
        const signUp: boolean = await uservice.doSignup(req)
        if (signUp === true){
            res.status(200).json("Succesfully created user")
        } else{
            res.status(401).json("couldn't create user")
        }
    } catch(err){
        next(err);
    }
}

// Login i.e. (kinda Read user)
export const loginHandling = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
   try{
       const user: Number = await uservice.loginHandler(req)
        if (user===-1){
            res.status(401).json("Couldn't match user credentials");
        } else if (user===-2) {
            throw new Error("Something went wrong");
        } else {
            throw new Error("idk");
            res.cookie('user',user,{signed: true, maxAge: 1000*60*60, httpOnly: true});
            res.status(200).json("Found user");
            res.send();
        }
    } catch (err){
        next(err);
    }
}

// Update a specific user, by finding them using their id
export const updateUserById = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try{
        const success: Number = await uservice.updateUserInfoById(req);
        if (success === 1){
            res.status(200).json("User updated successfully");
        } else {
            res.status(401).json("Something went wrong")
        }
    } catch(err){
        next(err);
    }
}

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
        next(err);
        //console.log(err)
    }
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
