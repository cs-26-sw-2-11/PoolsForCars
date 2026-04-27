import express from "express";
import * as userModel from '../models/user.model.js';

// Get all users
export const getUsersService = async () =>{
    const users: userModel.usersJSON = await userModel.readUsersJSON();
    return users
}

export const loginHandler = async (req: express.Request) => {
    const users = getUsersService();
    console.log(users);
}