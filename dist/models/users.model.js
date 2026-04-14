import { asyncWriteFile, asyncReadFile } from '../database/helper-functions.js';
const usersFile = "users.json";
export const createUsers = async (users) => {
    try {
        await asyncWriteFile(usersFile, JSON.stringify(Object.fromEntries(users)));
    }
    catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};
export const readUsers = async () => {
    try {
        const users = await asyncReadFile(usersFile);
        if (users.length == 0) {
            throw "No Users";
        }
        const parsedUsers = JSON.parse(users);
        const mapUsers = new Map(Object.entries(parsedUsers).map(([key, value]) => [
            Number(key),
            value
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
//# sourceMappingURL=users.model.js.map