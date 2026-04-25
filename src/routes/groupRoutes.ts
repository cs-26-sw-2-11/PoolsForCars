//=== IMPORTS ===///
import express from 'express';
import { filePath } from "./index.js"
import * as groupController from '../controllers/group.controller.js';

const router = express.Router();


router.route("/:userId/make")
    .post(groupController.makeAllGroups);


export default router;
