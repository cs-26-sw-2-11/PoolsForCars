// ====== IMPORTS ======
import * as fs from 'fs';
import { readUsers, usersFile, writeUsers } from './users.model.js';
import { asyncAppendLineToFile, asyncReadFile, asyncWriteFile, DATABASE_DIRNAME } from '../database/helper-functions.js';
// import type { Users } from './users.model.js';
import { createMeta } from './meta.model.js';
// ====== CONFIG ======
const USERS_FILE = "users/users.ndjson";
const META_FILE = "users/meta.json";
// ====== IN-MEMORY STATE ======
const USERS = new Map();
let meta;
let lastUserId = 0;
// ====== WRITE QUEUE ======
let writeQueue = Promise.resolve();
const enqueue = (task) => {
    writeQueue = writeQueue.then(task, task); // handle the rejected callback properly or something
    return writeQueue;
};
// ====== INIT (load from disk) ======;
export const initUsers = async () => {
    // Load meta-data
    if (fs.existsSync(DATABASE_DIRNAME + META_FILE)) {
        try {
            const metaString = await asyncReadFile(META_FILE);
            if (metaString.length !== 0) {
                meta = JSON.parse(metaString);
                lastUserId = meta.lastUserId;
            }
            else {
                meta = await createMeta();
            }
        }
        catch (error) {
            console.warn("Something went wrong, trying to initialize the users", error);
        }
    }
    // Load users
    if (fs.existsSync(DATABASE_DIRNAME + USERS_FILE)) {
        try {
            const users = await asyncReadFile(usersFile);
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
        const id = lastUserId++;
        user.id = id;
        // update memory
        USERS.set(id, user);
        // append to file
        await asyncAppendLineToFile(USERS_FILE, JSON.stringify(user));
        // persist meta
        if (meta) {
            console.log("meta data exists");
            meta.lastUserId = lastUserId;
            await asyncWriteFile(META_FILE, JSON.stringify(meta));
        }
        else {
            await asyncWriteFile(META_FILE, JSON.stringify({ lastUserId }));
        }
        return user;
    });
};
export const readUser = async (user_id) => {
    try {
        return USERS.get(user_id);
    }
    catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};
export const updateUser = async (id, updated_user) => {
    return enqueue(async () => {
        // update memory
        USERS.set(id, updated_user);
        // update file
        await writeUsers(USERS);
    });
};
export const deleteUser = async (id) => {
    return enqueue(async () => {
        // update memory
        USERS.delete(id);
        // update file
        await writeUsers(USERS);
    });
};
//# sourceMappingURL=user.model.js.map