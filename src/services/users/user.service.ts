import * as userModel from "../../models/user.model.js";
import * as userHelper from "./user.helper.service.js";
import * as groupService from "../groups/group.service.js";
import type { Week } from "../../models/week.model.js";

export type LoginResult =
    | { success: true; userId: number }
    | { success: false; reason: string };

export type signUpResult = "User_Created" | "Phone_Number_Taken" | string;

// Handles logins
export const loginService = async (
    lastName: string,
    phoneNumber: string,
): Promise<LoginResult> => {
    // Loads all the users, using an asynchronous function
    try {
        const users = userModel.readUsersJSON();

        if (!users || Object.keys(users).length === 0) throw new Error("Empty db");

        // Sorts through all the users, using the object from the key value paired users, since the user is the value.
        for (const user of Object.values(users)) {
            if (user.lastName === lastName && user.phoneNumber === phoneNumber) {
                //console.log(value.id)
                // Return the user id, if the user exists in the database.
                return { success: true, userId: user.id };
            }
        }
        throw new Error("invalid_credentials")
    } catch (error) {
        // Returns -1, an id not found in the database, if login doesnt match an user.
        return { success: false, reason: String(error) };
    }
};

// The actual called function responsible for the signup
export const doSignup = async (
    firstName: string,
    lastName: string,
    phoneNumber: string,
    preferences: userHelper.userPreferences,
): Promise<signUpResult> => {
    // Unpacks all the information send through the form found on the signup page.
    try {
        const user: userModel.User = await userHelper.unpackUser(
            firstName,
            lastName,
            phoneNumber,
            preferences,
        );

        const exists: boolean = await userHelper.doUserExist(user);
        console.log(exists)

        if (exists === false) {
            const newUser: userModel.User = await userHelper.createUser(user);

            //console.log("finished geocoding");

            newUser.driverInGroups = await groupService.makeNewGroups(user);

            //console.log("finished making groups");

            userModel.updateUser(newUser.id, newUser);

            return "User_Created";
        } else if (exists === true) {
            return "Phone_Number_Taken";
        } else {
            throw new Error("Something went wrong while trying to create your user");
        }
        // Needs to do something to let the user know their profile has been created.
        // done, it redirects
    } catch (error) {
        throw error;
    }
};

export const updateUserInfoById = async (
    firstName: string,
    lastName: string,
    phoneNumber: string,
    lookingForGroups: boolean,
    schedule: Week,
    userId: string,
): Promise<boolean> => {
    let user: userModel.User = userModel.readUser(Number(userId));
    const oldUser: userModel.User = { ...user };
    if (!firstName || !lastName || !phoneNumber)
        throw new Error("Couldn't get data");
    user.firstName = firstName;
    user.lastName = lastName;
    user.phoneNumber = phoneNumber;
    user.lookingForGroups = lookingForGroups;
    user.schedule = schedule;
    if (
        user.firstName === oldUser.firstName &&
        user.lastName === oldUser.lastName &&
        user.phoneNumber === oldUser.phoneNumber &&
        user.lookingForGroups === oldUser.lookingForGroups
    ) {
        return false;
    } else {
        userModel.updateUser(Number(userId), user);
        return true;
    }
};
