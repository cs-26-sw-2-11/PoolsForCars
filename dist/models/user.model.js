// ====== IMPORTS ======
import * as fs from 'fs';
import { asyncAppendLineToFile, asyncReadFile, asyncWriteFile, DATABASE_DIRNAME } from '../database/helper-functions.js';
import {} from './week.model.js';
// ====== CONFIG ======
export const USERS_FILE = "users/users.ndjson";
export const META_FILE = "users/meta.json";
// ====== IN-MEMORY STATE ======
const USERS = new Map();
let meta;
let lastUserId = 0;
// ====== WRITE QUEUE ======
let userWriteQueue = Promise.resolve();
const enqueue = (task) => {
    userWriteQueue = userWriteQueue.then(task, task); // handle the rejected callback properly or something
    return userWriteQueue;
};
// ====== INIT (load from disk) ======;
export const initUsers = async () => {
    // Load meta-data
    if (fs.existsSync(DATABASE_DIRNAME + META_FILE)) {
        try {
            const metaString = await asyncReadFile(META_FILE);
            if (metaString.length !== 0) {
                meta = JSON.parse(metaString);
            }
            else {
                meta = { lastId: 0 };
            }
        }
        catch (error) {
            console.warn("Something went wrong, trying to initialize the users", error);
        }
    }
    // Load users
    if (fs.existsSync(DATABASE_DIRNAME + USERS_FILE)) {
        try {
            const users = await asyncReadFile(USERS_FILE);
            const parsedUsers = users
                .split("\n")
                .filter(line => line.trim() !== "")
                .map(line => JSON.parse(line));
            parsedUsers.forEach(user => {
                USERS.set(user.id, user);
            });
        }
        catch (error) {
            console.warn("Something went wrong, trying to initialize the users", error);
        }
    }
};
// ====== CREATE USER (SAFE) ======
export const createUser = async (user) => {
    return enqueue(async () => {
        user.id = meta.lastId++;
        // update memory
        USERS.set(user.id, user);
        // append to file
        await asyncAppendLineToFile(USERS_FILE, JSON.stringify(user));
        // persist meta
        await asyncWriteFile(META_FILE, JSON.stringify(meta));
        return user;
    });
};
// ====== READ USER ======
export const readUser = async (user_id) => {
    try {
        return USERS.get(user_id);
    }
    catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};
// ====== UPDATE USER ======
export const updateUser = async (id, updated_user) => {
    return enqueue(async () => {
        // update memory
        USERS.set(id, updated_user);
        // update file
        await writeUsers(USERS);
    });
};
// ====== DELETE USER ======
export const deleteUser = async (id) => {
    return enqueue(async () => {
        // update memory
        USERS.delete(id);
        // update file
        await writeUsers(USERS);
    });
};
// ====== WRITE USERS ======
export const writeUsers = async (users) => {
    try {
        await asyncWriteFile(USERS_FILE, "");
        for (const key of users.keys()) {
            await asyncAppendLineToFile(USERS_FILE, JSON.stringify(users.get(key)));
        }
    }
    catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};
// ====== READ USERS ======
export const readUsers = async () => {
    try {
        const users = await asyncReadFile(USERS_FILE);
        if (users.length == 0) {
            throw "No Users";
        }
        const parsedUsers = users
            .split("\n")
            .filter(line => line.trim() !== "")
            .map(line => JSON.parse(line));
        const mapUsers = new Map(parsedUsers.map(user => [
            user.id,
            user
        ]));
        return mapUsers;
    }
    catch (error) {
        if (error == "No Users") {
            return new Map;
        }
        console.log(error);
        throw error; // TODO: handle it properly
    }
};
//# sourceMappingURL=user.model.js.map