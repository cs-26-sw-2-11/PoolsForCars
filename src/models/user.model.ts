import type { CalenderDay } from './calender_day.model.js';
import type { Users } from './users.model.js';

import { createUsers, readUsers } from './users.model.js';

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    calender: CalenderDay[];
}

export const createUser = async (user: User) => {
    try {
        let users: Users = await readUsers();
        users.set(users.size + 1, user);
        createUsers(users);
    } catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};

export const readUser = async (userID: number) => {
    try {
        let users: Users = await readUsers();
        return users.get(userID);
    } catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};

export const updateUser = async (userID: number, user: User) => {
    try {
        let users: Users = await readUsers();
        users.set(userID, user);
        createUsers(users);
    } catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};

export const deleteUser = async (userID: number) => {
    try {
        let users: Users = await readUsers();
        users.delete(userID);
        createUsers(users);
    } catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};
