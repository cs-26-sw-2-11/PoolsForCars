import { type Week } from './week.model.js';
export interface User {
    id: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    schedule: Week;
    calender: Week[];
    groups: number[];
}
export type Users = Map<number, User>;
export declare const initUsers: () => Promise<void>;
export declare const createUser: (user: User) => Promise<User>;
export declare const readUser: (user_id: number) => Promise<User>;
export declare const updateUser: (id: number, updated_user: User) => Promise<void>;
export declare const deleteUser: (id: number) => Promise<void>;
//# sourceMappingURL=user.model.d.ts.map