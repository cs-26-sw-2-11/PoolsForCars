//=== IMPORTS ===///
import express from 'express';
import { filePath } from "./index.js"
import * as calendarController from '../controllers/calendar.controller.js';

const router = express.Router();


router.route("")
    .get((req, res) => {
        res.sendFile(filePath + "/calendarindex.html");
    });

router.route("/:userId")
    .get(calendarController.getCalendar)

router.route("/:userId/:weekNumber")
    .get(calendarController.getCalendarWeek)

//
// calendarRoutes.get('/:calendarId', calendarController.getcalendarById);
//
// calendarRoutes.post('/', calendarController.createcalendar);
export default router;
