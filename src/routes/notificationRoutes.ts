//=== IMPORTS ===///
import express from 'express';

import * as notificationController from '../controllers/notification.controller.js'

const router = express.Router();

router.get("/:userId", notificationController.getNotifications);

export default router;
