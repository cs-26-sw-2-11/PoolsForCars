import express from "express";

import * as userModel from '../models/user.model.js';
import * as groupService from "../services/groups/group.service.js";
import * as groupExecutor from "../services/groups/group.executor.js";
import * as compatibilityModel from "../models/compatibility.model.js";
import { findEligbleDrivers } from "../matching/temporal_compatibility.js";
import { group } from "console";
import { updateGroup } from "../models/group.model.js";


// ───────────────────────────────────────────────────────────────
//  :::::: MAIN CRUD FUNCTIONS ::::::
// ───────────────────────────────────────────────────────────────

export const getGroups = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log("getting groups");
    const groups: groupService.Group[] = await groupService.getAllUserGroupsAsDriver(Number(req.params['userId']));
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

    await groupService.searchForGroups(user, compatibilityMap);

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
    const user: userModel.User = await userModel.readUser(userId);

    const insertionPlan: groupService.InsertionPlan | undefined = group.pendingMembers[userId];
    if (typeof insertionPlan === 'undefined') {
        res.status(409).json({ message: "User cannot be accpeted into this group." });
        return;
    }
    console.log("\n");
    console.log("\n");
    console.log("\n");
    console.log("\n");
    console.log("--------------------------------------------------------");
    console.log(JSON.stringify(insertionPlan, null, 2));

    const updatedGroup = await groupService.appendPassengerToGroup(group, insertionPlan);

    user.passengerInGroups.push(updatedGroup.id);

    const userDay = user.calendar[group.week]?.days[group.day];
    if (userDay) userDay.groups[0] = updatedGroup.id;

    await userModel.updateUser(user.id, user);

    const refreshedGroup: groupService.Group = await groupService.refreshPendingMembers(updatedGroup);

    await updateGroup(group.id, refreshedGroup);

    res.status(200).json(refreshedGroup);
}


export const denyGroupMember = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    const group: groupService.Group = await groupService.getGroup(Number(req.params['groupId']));
    const userId: number = Number(req.params['userId']);

    const insertionPlan: groupService.InsertionPlan | undefined = group.pendingMembers[userId];
    if (typeof insertionPlan === 'undefined') return; // do something


    const updatedGroup: groupService.Group = await groupService.denyPassengerFromGroup(group, insertionPlan.insertionCandidate);

    res.status(200).json(updatedGroup);
}
