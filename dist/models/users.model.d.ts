import type { User } from './user.model.js';
export type Users = Map<number, User>;
export declare const writeUsers: (users: Users) => Promise<void>;
export declare const readUsers: () => Promise<Users>;
//# sourceMappingURL=users.model.d.ts.map