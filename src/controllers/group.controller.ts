import express from "express";

import * as userModel from '../models/user.model.js';
import * as groupService from "../services/groups/group.service.js";
import * as groupExecutor from "../services/groups/group.executor.js";
import * as compatibilityModel from "../models/compatibility.model.js";
import { findEligbleDrivers } from "../matching/temporal_compatibility.js";
import { group } from "console";


// ───────────────────────────────────────────────────────────────
//  :::::: MAIN CRUD FUNCTIONS ::::::
// ───────────────────────────────────────────────────────────────

export const getGroups = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log("getting groups");
    const groups: groupService.Group[] = await groupService.getAllUserGroups(Number(req.params['userId']));
    res.status(200).json(groups);
}

export const getGroupsAsDriver = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    console.log("getting driver groups");

    const groups: groupService.Group[] = await groupService.getAllUserGroupsAsDriver(Number(req.params['userId']));

    res.status(200).json(groups);
}

export const getGroupsAsPassenger = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log("getting groups");
    const groups: groupService.Group[] = await groupService.getAllUserGroupsAsPassenger(Number(req.params['userId']));
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

    const userDriverGroups: number[] = await groupService.makeNewGroups(user);

    user.driverInGroups = userDriverGroups;

    await userModel.updateUser(user.id, user);
    res.status(200).json(user);
}

export const acceptGroupMember = async (req: express.Request, res: express.Response, next: express.NextFunction) => {


    const group: groupService.Group = await groupService.getGroup(Number(req.params['groupId']));
    const userId: number = Number(req.params['userId']);

    const insertionPlan: groupService.InsertionPlan | undefined = group.pendingMembers[userId];
    if (typeof insertionPlan === 'undefined') return; // do something

    await groupService.appendPassengerToGroup(group.id, insertionPlan);

    const updatedGroup: groupService.Group = await groupService.refreshPendingMembers(group.id);

    res.status(200).json(updatedGroup);
}


export const denyGroupMember = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    const groupId: number = Number(req.params['groupId']);

    const candidate: groupService.Candidate = req.body;

    const updatedGroup: groupService.Group = await groupService.denyPassengerFromGroup(groupId, candidate);

    res.status(200).json(updatedGroup);
}
