import { createUsers, readUsers } from './users.model.js';
export const createUser = async (user) => {
    try {
        let users = await readUsers();
        users.set(users.size, user);
        await createUsers(users);
        // console.log(`Finished making user ${user.id}`)
    }
    catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};
export const readUser = async (userID) => {
    try {
        let users = await readUsers();
        return users.get(userID);
    }
    catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};
export const updateUser = async (userID, user) => {
    try {
        let users = await readUsers();
        users.set(userID, user);
        createUsers(users);
    }
    catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};
export const deleteUser = async (userID) => {
    try {
        let users = await readUsers();
        users.delete(userID);
        createUsers(users);
    }
    catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};
//# sourceMappingURL=user.model.js.map