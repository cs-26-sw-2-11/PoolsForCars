import type { CalenderDay } from './calender_day.model.js';

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    calender: CalenderDay[];
}

export const createUser = (user: User) => {
    // code to create user from database
};

export const readUser = (user: User) => {
    // code to read user from database
};

export const updateUser = (user: User) => {
    // code to update user from database
};

export const deleteUser = (user: User) => {
    // code to delete user from database
};
