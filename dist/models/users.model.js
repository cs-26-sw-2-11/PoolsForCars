import { asyncWriteFile, asyncReadFile, asyncAppendLineToFile } from '../database/helper-functions.js';
export const usersFile = "users.ndjson";
export const writeUsers = async (users) => {
    try {
        for (const user of users) {
            await asyncAppendLineToFile(usersFile, JSON.stringify(user));
        }
    }
    catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};
export const readUsers = async () => {
    try {
        const users = await asyncReadFile(usersFile);
        // console.log("User file:", users);
        if (users.length == 0) {
            throw "No Users";
        }
        return users
            .split("\n")
            .filter(line => line.trim() !== "")
            .map(line => JSON.parse(line));
    }
    catch (error) {
        if (error == "No Users") {
            return [];
        }
        console.log(error);
        throw error; // TODO: handle it properly
    }
};
//# sourceMappingURL=users.model.js.map