//=== IMPORTS ===///
import express from 'express';
import { filePath } from "./index.js"

const router = express.Router();


router.route("")
    .get((req, res) => {
        res.clearCookie("userId");
        res.redirect("/login");
    });

//
// calendarRoutes.get('/:calendarId', calendarController.getcalendarById);
//
// calendarRoutes.post('/', calendarController.createcalendar);
export default router;
