import express from "express";

import * as userModel from '../models/user.model.js';
import * as groupService from "../services/group.service.js";
import { groupEnd } from "node:console";


// ───────────────────────────────────────────────────────────────
//  :::::: MAIN CRUD FUNCTIONS ::::::
// ───────────────────────────────────────────────────────────────

export const searchForGroups = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user: userModel.User = await userModel.readUser(Number(req.params['userId']));

    res.status(200).json();
}


export const makeAllGroups = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user: userModel.User = await userModel.readUser(Number(req.params['userId']));
    for (const week of Object.values(user.calendar)) {
        for (const day of Object.values(week.days)) {
            if (!(day.carpoolingIntent && day.carAvailability)) continue;
            const group: groupService.Group = await groupService.makeNewGroup(user.id, day);
            user.groups.push(group.id);
        }
    }

    await userModel.updateUser(user.id, user);
    res.status(200).json(user);
}
