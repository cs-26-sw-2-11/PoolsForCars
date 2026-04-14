import { readUsers, usersFile, writeUsers } from './users.model.js';
import { asyncAppendLineToFile } from '../database/helper-functions.js';
export const createUser = async (user) => {
    try {
        await asyncAppendLineToFile(usersFile, JSON.stringify(user));
    }
    catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};
export const readUser = async (user_id) => {
    try {
        let users = await readUsers();
        return users.get(user_id);
    }
    catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};
export const updateUser = async (user_id, updated_user) => {
    try {
        let users = await readUsers();
        users.set(user_id, updated_user);
        writeUsers(users);
    }
    catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};
export const deleteUser = async (user_id) => {
    try {
        let users = await readUsers();
        console.log(users.delete(user_id));
        writeUsers(users);
    }
    catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};
//# sourceMappingURL=user.model.js.map