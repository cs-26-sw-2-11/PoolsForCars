import { readUsers, usersFile, writeUsers } from './users.model.js';
import { asyncAppendLineToFile } from '../database/helper-functions.js'


import type { CalenderDay } from './calender_day.model.js';
import type { Users } from './users.model.js';


export interface User {
    id: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    calender: CalenderDay[];
}


export const createUser = async (user: User) => {
    try {
        await asyncAppendLineToFile(usersFile, JSON.stringify(user));
    } catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};

export const readUser = async (user_id: number) => {
    try {
        let users: Users = await readUsers();
        return users[user_id];
    } catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};

export const updateUser = async (user_id: number, updated_user: User) => {
    try {
        let users: Users = await readUsers();
        users[user_id] = updated_user;
        writeUsers(users);
    } catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};

// export const deleteUser = async (user_id: number) => {
//     try {
//         let users: Users = await readUsers();
//         users.delete(userID);
//         createUsers(users);
//     } catch (error) {
//         console.log(error);
//         throw error; // TODO: handle it properly
//     }
// };
