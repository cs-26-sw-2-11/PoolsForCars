import express from 'express';

export const calenderRoutes = express.Router();

import * as calenderController from '../controllers/calender.controller.js';

calenderRoutes.route("/:userId")
    .get(calenderController.getCalender)



// calenderRoutes.get('/', calenderController.getCalenders);
//
// calenderRoutes.get('/:calenderId', calenderController.getcalenderById);
//
// calenderRoutes.post('/', calenderController.createcalender);

