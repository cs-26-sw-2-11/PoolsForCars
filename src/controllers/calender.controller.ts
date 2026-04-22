import express from "express";

import * as userModel from '../models/user.model.js';
import * as weekModel from "../models/week.model.js";

// ───────────────────────────────────────────────────────────────
//  :::::: MAIN CRUD FUNCTIONS ::::::
// ───────────────────────────────────────────────────────────────

export const getCalender = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user: userModel.User = await userModel.readUser(Number(req.params['userId']));
    const calender: weekModel.Calender = user.calender;
    res.status(200).json(calender);
}

// export const createWeek = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
//
// }
