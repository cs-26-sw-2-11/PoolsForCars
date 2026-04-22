import express from 'express';

export const userRoutes = express.Router();

import * as userController from '../controllers/user.controller.js';
import { calenderRoutes } from './calenderRoutes.js';
import * as calenderController from '../controllers/calender.controller.js';

userRoutes.route("")
    .get(userController.getUsers)
    .post(userController.createUser);

userRoutes.get('/:userId', userController.getUserById);


// userRoutes.get('/:userId/calender', calenderController.getCalender);
