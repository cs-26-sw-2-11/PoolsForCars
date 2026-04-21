import express from "express";

import * as userModel from '../models/user.model.js';
import * as userSeeder from '../seeder/user.seeder.js';


// ───────────────────────────────────────────────────────────────
//  :::::: MAIN CRUD FUNCTIONS ::::::
// ───────────────────────────────────────────────────────────────

export const getFakeUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const fakeUser: userModel.User = await userSeeder.createRandomUser();
    res.status(200).json(fakeUser);
}
