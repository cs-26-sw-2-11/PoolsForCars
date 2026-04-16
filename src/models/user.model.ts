// ====== IMPORTS ======
import * as fs from 'fs';
import { asyncAppendLineToFile, asyncReadFile, asyncWriteFile, DATABASE_DIRNAME } from '../database/helper-functions.js'

import type { CalenderDay } from './calender_day.model.js';
import { createMeta, type Meta } from './meta.model.js'
import type { Week } from './week.model.js';

// ====== TYPES ======
export interface User {
    id: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    schedule: Week;
    calender: Week[];
    groups: number[];
}

export type Users = Map<number, User>;

// ====== CONFIG ======
export const USERS_FILE: string = "users/users.ndjson";
const META_FILE: string = "users/meta.json";

// ====== IN-MEMORY STATE ======
const USERS = new Map<number, User>() as Users;
let meta: Meta;
let lastUserId: number = 0;

// ====== WRITE QUEUE ======
let writeQueue: Promise<any> = Promise.resolve();
const enqueue = <T>(task: () => Promise<T>): Promise<T> => {
    writeQueue = writeQueue.then(task, task); // handle the rejected callback properly or something
    return writeQueue;
}

// ====== INIT (load from disk) ======;
export const initUsers = async (): Promise<void> => {
    // Load meta-data
    if (fs.existsSync(DATABASE_DIRNAME + META_FILE)) {
        try {
            const metaString: string = await asyncReadFile(META_FILE);
            if (metaString.length !== 0) {
                meta = JSON.parse(metaString);
                lastUserId = meta.lastUserId;
            } else {
                meta = await createMeta();
            }
        } catch (error) {
            console.warn("Something went wrong, trying to initialize the users", error);
        }
    }

    // Load users
    if (fs.existsSync(DATABASE_DIRNAME + USERS_FILE)) {
        try {
            const users: string = await asyncReadFile(USERS_FILE);

            const parsedUsers: User[] = users
                .split("\n")
                .filter(line => line.trim() !== "")
                .map(line => JSON.parse(line)) as User[];

            parsedUsers.forEach(user => {
                USERS.set(user.id, user);
            });
        } catch (error) {
            console.warn("Something went wrong, trying to initialize the users", error);
        }
    }
}

// ====== CREATE USER (SAFE) ======
export const createUser = async (user: User): Promise<User> => {
    return enqueue(async () => {
        const id: number = lastUserId++;
        user.id = id;

        // update memory
        USERS.set(id, user);

        // append to file
        await asyncAppendLineToFile(USERS_FILE, JSON.stringify(user));

        // persist meta
        if (meta) {
            console.log("meta data exists");
            meta.lastUserId = lastUserId;
            await asyncWriteFile(META_FILE, JSON.stringify(meta))
        } else {
            await asyncWriteFile(META_FILE, JSON.stringify({ lastUserId }))
        }

        return user;
    })
}

// ====== READ USER ======
export const readUser = async (user_id: number): Promise<User> => {
    try {
        return USERS.get(user_id) as User;
    } catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};

// ====== UPDATE USER ======
export const updateUser = async (id: number, updated_user: User): Promise<void> => {
    return enqueue(async () => {
        // update memory
        USERS.set(id, updated_user);

        // update file
        await writeUsers(USERS);
    })
};

// ====== DELETE USER ======
export const deleteUser = async (id: number): Promise<void> => {
    return enqueue(async () => {
        // update memory
        USERS.delete(id);

        // update file
        await writeUsers(USERS);
    })
};

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
