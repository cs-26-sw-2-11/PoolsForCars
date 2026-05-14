//=== IMPORTS ===///
import express from 'express';
import * as groupController from '../controllers/group.controller.js';

const router = express.Router();

// GET

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
