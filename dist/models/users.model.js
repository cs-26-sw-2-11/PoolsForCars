// ====== IMPORTS ======
import { asyncReadFile, asyncAppendLineToFile, asyncWriteFile } from '../database/helper-functions.js';
import { USERS_FILE } from './user.model.js';
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
//# sourceMappingURL=users.model.js.map