import express from 'express';

export const userRoutes = express.Router();

import * as userController from '../controllers/user.controller.js';


userRoutes.get('/', userController.getUsers);

userRoutes.get('/:userId', userController.getUserById);

userRoutes.post('/', userController.createUser);

