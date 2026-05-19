import express from 'express';

export const userRoutes = express.Router();

import * as userController from '../controllers/user.controller.js';

userRoutes.route("")
    .post(userController.createUser);

userRoutes.get('/:userId', userController.getUserById);
userRoutes.get('/all', userController.getUsers)


// userRoutes.get('/:userId/calendar', calendarController.getCalendar);
