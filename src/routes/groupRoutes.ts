//=== IMPORTS ===///
import express from 'express';
import * as groupController from '../controllers/group.controller.js';
import { filePath } from "./index.js"

const router = express.Router();

// GET

router.route("")
    .get((req, res) => {
        res.sendFile(filePath + "/groups.html");
    })

router.route("/:userId")
    .get(groupController.getGroups);

router.route("/:userId/driver")
    .get(groupController.getGroupsAsDriver);

router.route("/:userId/passenger")
    .get(groupController.getGroupsAsPassenger);

// ----------------------------------------


router.route("/:userId/make")
    .post(groupController.makeAllGroups);

router.route("/:userId/search")
    .post(groupController.searchForGroups);


router.route("/:groupId/:userId/accept")
    .post(groupController.acceptGroupMember);


router.route("/:groupId/:userId/deny")
    .post(groupController.denyGroupMember);

export default router;
