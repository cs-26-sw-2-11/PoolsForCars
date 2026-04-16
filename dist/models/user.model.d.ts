import type { CalenderDay } from './calender_day.model.js';
export interface User {
    id: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    calender: CalenderDay[];
}
export type Users = Map<number, User>;
export declare const initUsers: () => Promise<void>;
export declare const createUser: (user: User) => Promise<User>;
export declare const readUser: (user_id: number) => Promise<User>;
export declare const updateUser: (id: number, updated_user: User) => Promise<void>;
export declare const deleteUser: (id: number) => Promise<void>;
//# sourceMappingURL=user.model.d.ts.map