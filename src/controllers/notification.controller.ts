import express from "express";

import * as groupService from "../services/groups/group.service.js";

// ───────────────────────────────────────────────────────────────
//  :::::: MAIN CRUD FUNCTIONS ::::::
// ───────────────────────────────────────────────────────────────

export const getNotifications = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const groups: groupService.Group[] = await groupService.getAllUserGroupsAsDriver(Number(req.params['userId']));

    const notifications: { info: { groupId: number, day: string, week: number }, plans: Record<number, groupService.InsertionPlan> }[] = [];
    for (const group of groups) {
        if (Object.keys(group.pendingMembers).length === 0) {
            continue;
        }
        notifications.push(
            {
                info: {
                    groupId: group.id,
                    day: group.day,
                    week: group.week
                },
                plans: group.pendingMembers
            }
        )
    }

    res.status(200).json(notifications);
}
