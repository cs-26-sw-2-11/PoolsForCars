import type { CalenderDay } from './calender_day.model.js';
export interface User {
    id: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    calender: CalenderDay[];
}
export declare const createUser: (user: User) => Promise<void>;
export declare const readUser: (userID: number) => Promise<User | undefined>;
export declare const updateUser: (userID: number, user: User) => Promise<void>;
export declare const deleteUser: (userID: number) => Promise<void>;
//# sourceMappingURL=user.model.d.ts.map