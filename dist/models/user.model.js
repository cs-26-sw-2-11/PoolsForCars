import { readUsers, usersFile } from './users.model.js';
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
export const readUser = async (userID) => {
    try {
        let users = await readUsers();
        return users[userID];
    }
    catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};
// export const updateUser = async (userID: number, user: User) => {
//     try {
//         let users: Users = await readUsers();
//         users.set(userID, user);
//         createUsers(users);
//     } catch (error) {
//         console.log(error);
//         throw error; // TODO: handle it properly
//     }
// };
//
// export const deleteUser = async (userID: number) => {
//     try {
//         let users: Users = await readUsers();
//         users.delete(userID);
//         createUsers(users);
//     } catch (error) {
//         console.log(error);
//         throw error; // TODO: handle it properly
//     }
// };
//# sourceMappingURL=user.model.js.map