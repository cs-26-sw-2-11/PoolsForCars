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
//# sourceMappingURL=user.model.d.ts.map