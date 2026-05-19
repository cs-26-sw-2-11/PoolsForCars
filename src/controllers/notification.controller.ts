import express from "express";

import * as groupService from "../services/groups/group.service.js";

// ───────────────────────────────────────────────────────────────
//  :::::: MAIN CRUD FUNCTIONS ::::::
// ───────────────────────────────────────────────────────────────

export const getNotifications = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const groups: groupService.Group[] = await groupService.getAllUserGroupsAsDriver(Number(req.params['userId']));

    const notifications: Record<number, Record<number, groupService.InsertionPlan>> = {};
    groups.forEach(group => {
        if (Object.keys(group.pendingMembers).length !== 0) {
            notifications[group.id] = group.pendingMembers;
        }
    });

    res.status(200).json(notifications);
}
