//=== IMPORTS ===///
import express from 'express';
import { filePath } from "./index.js"

import * as notificationController from '../controllers/notification.controller.js'

const router = express.Router();

router.route("")
    .get((req, res) => {
        res.sendFile(filePath + "/notifications.html");
    })
router.get("/:userId", notificationController.getNotifications);

export default router;
