import { asyncReadFile, asyncAppendLineToFile, asyncWriteFile } from '../database/helper-functions.js';
export const usersFile = "users.ndjson";
export const writeUsers = async (users) => {
    try {
        await asyncWriteFile(usersFile, "");
        for (const key of users.keys()) {
            await asyncAppendLineToFile(usersFile, JSON.stringify(users.get(key)));
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