//=== IMPORTS ===///
import express from 'express';
import { filePath } from "./index.js"
import * as calenderController from '../controllers/calender.controller.js';

const router = express.Router();


router.route("")
    .get((req, res) => {
        res.sendFile(filePath + "/calenderindex.html");
    });

router.route("/:userId")
    .get(calenderController.getCalender)



//
// calenderRoutes.get('/:calenderId', calenderController.getcalenderById);
//
// calenderRoutes.post('/', calenderController.createcalender);
export default router;
