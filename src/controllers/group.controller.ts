import express from "express";

import * as userModel from '../models/user.model.js';
import * as groupService from "../services/groups/group.service.js";
import * as compatibilityModel from "../models/compatibility.model.js";
import { findEligbleDrivers } from "../matching/temporal_compatibility.js";


// ───────────────────────────────────────────────────────────────
//  :::::: MAIN CRUD FUNCTIONS ::::::
// ───────────────────────────────────────────────────────────────

export const getGroups = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log("getting groups");
    const groups: groupService.Group[] = await groupService.getAllUserGroups(Number(req.params['userId']));
    res.status(200).json(groups);
}

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
    const user: userModel.User = await userModel.readUser(Number(req.params['userId']));
    for (const week of Object.entries(user.calendar)) {
        for (const day of Object.entries(week[1].days)) {
            if (!(day[1].carpoolingIntent && day[1].carAvailability)) continue;
            const group: groupService.Group = await groupService.makeNewGroup(user.id, day[1], day[0], Number(week[0]));
            user.groups.push(group.id);
        }
    }

    await userModel.updateUser(user.id, user);
    res.status(200).json(user);
}
