import express from "express";

import * as userModel from '../models/user.model.js';
import * as groupService from "../services/groups/group.service.js";
import * as compatibilityModel from "../models/compatibility.model.js";
import { findEligbleDrivers } from "../matching/temporal_compatibility.js";


// ───────────────────────────────────────────────────────────────
//  :::::: MAIN CRUD FUNCTIONS ::::::
// ───────────────────────────────────────────────────────────────

export const searchForGroups = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user: userModel.User = await userModel.readUser(Number(req.params['userId']));
    const compatibilityMap: compatibilityModel.WeeklyCompatibilityIndex = await findEligbleDrivers(user);

    console.log("\n");
    console.log("\n");
    console.log("\n");
    console.log(`Searching for groups for user ${user.id}`);
    console.log(JSON.stringify(compatibilityMap, null, 2));

    groupService.searchForGroups(user, compatibilityMap);

    res.status(200).json(user);
}


export const makeAllGroups = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log("alloo");
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
