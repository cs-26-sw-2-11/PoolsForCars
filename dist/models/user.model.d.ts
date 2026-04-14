import type { CalenderDay } from './calender_day.model.js';
export interface User {
    id: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    calender: CalenderDay[];
}
export declare const createUser: (user: User) => Promise<void>;
export declare const readUser: (user_id: number) => Promise<User | undefined>;
export declare const updateUser: (user_id: number, updated_user: User) => Promise<void>;
export declare const deleteUser: (user_id: number) => Promise<void>;
//# sourceMappingURL=user.model.d.ts.map