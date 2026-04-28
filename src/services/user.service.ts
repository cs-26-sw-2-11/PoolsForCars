import express from "express";
import * as userModel from '../models/user.model.js';


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

