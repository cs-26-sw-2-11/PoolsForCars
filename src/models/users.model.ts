import type { User } from './user.model.js';

import { asyncWriteFile, asyncReadFile } from '../database/helper-functions.js';

export const usersFile: string = "users.ndjson";

export type Users = User[];

// export const createUsers = async (users: Users): Promise<void> => {
//     try {
//         await asyncWriteFile(usersFile, JSON.stringify(Object.fromEntries(users)));
//     } catch (error) {
//         console.log(error);
//         throw error; // TODO: handle it properly
//     }
// };

export const readUsers = async (): Promise<Users> => {
    try {
        const users: string = await asyncReadFile(usersFile);
        // console.log("User file:", users);
        if (users.length == 0) {
            throw "No Users";
        }

        return users
            .split("\n")
            .filter(line => line.trim() !== "")
            .map(line => JSON.parse(line)) as Users;
    } catch (error) {
        if (error == "No Users") {
            return [] as User[];
        }
        console.log(error);
        throw error; // TODO: handle it properly
    }
};
