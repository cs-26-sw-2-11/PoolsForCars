import type { User } from './user.model.js';

import { asyncWriteFile, asyncReadFile } from '../database/helper-functions.js';

const usersFile: string = "users.json";

export type Users = Map<number, User>;

export const createUsers = async (users: Users): Promise<void> => {
    try {
        await asyncWriteFile(usersFile, JSON.stringify(Object.fromEntries(users)));
    } catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};

export const readUsers = async (): Promise<Users> => {
    try {
        const users: string = await asyncReadFile(usersFile);
        // console.log("User file:", users);
        if (users.length == 0) {
            throw "No Users";
        }

        const parsedUsers: Record<number, User> = JSON.parse(users) as Record<number, User>;

        const mapUsers: Users = new Map<number, User>(
            Object.entries(parsedUsers).map(([key, value]) => [
                Number(key),
                value
            ])
        );
        return mapUsers;
    } catch (error) {
        if (error == "No Users") {
            return new Map<number, User> as Users;
        }
        console.log(error);
        throw error; // TODO: handle it properly
    }
};
