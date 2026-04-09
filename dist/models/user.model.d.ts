import type { CalenderDay } from './calender_day.model.js';
export interface User {
    id: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    calender: CalenderDay[];
}
export declare const createUser: (user: User) => void;
export declare const readUser: (user: User) => void;
export declare const updateUser: (user: User) => void;
export declare const deleteUser: (user: User) => void;
//# sourceMappingURL=user.model.d.ts.map