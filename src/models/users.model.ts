import type { User } from './user.model.js';
import { asyncReadFile, asyncAppendLineToFile, asyncWriteFile } from '../database/helper-functions.js';


export type Users = Map<number, User>;


export const usersFile: string = "users.ndjson";


export const writeUsers = async (users: Users): Promise<void> => {
    try {
        await asyncWriteFile(usersFile, "");
        for (const key of users.keys()) {
            await asyncAppendLineToFile(usersFile, JSON.stringify(users.get(key)));
        }
    } catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};

export const readUsers = async (): Promise<Users> => {
    try {
        const users: string = await asyncReadFile(usersFile);

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
