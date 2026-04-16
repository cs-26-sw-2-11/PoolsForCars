// ====== IMPORTS ======
import { asyncReadFile, asyncAppendLineToFile, asyncWriteFile } from '../database/helper-functions.js';
import { USERS_FILE } from './user.model.js';

import type { User } from './user.model.js';

// ====== TYPES ======
export type Users = Map<number, User>;

// ====== WRITE USERS ======
export const writeUsers = async (users: Users): Promise<void> => {
    try {
        await asyncWriteFile(USERS_FILE, "");
        for (const key of users.keys()) {
            await asyncAppendLineToFile(USERS_FILE, JSON.stringify(users.get(key)));
        }
    } catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};

// ====== READ USERS ======
export const readUsers = async (): Promise<Users> => {
    try {
        const users: string = await asyncReadFile(USERS_FILE);

        if (users.length == 0) {
            throw "No Users";
        }

        const parsedUsers: User[] = users
            .split("\n")
            .filter(line => line.trim() !== "")
            .map(line => JSON.parse(line)) as User[];

        const mapUsers: Users = new Map<number, User>(
            parsedUsers.map(user => [
                user.id,
                user
            ])
        );
        return mapUsers;
    } catch (error) {
        if (error == "No Users") {
            return new Map<number, User>;
        }
        console.log(error);
        throw error; // TODO: handle it properly
    }
};
