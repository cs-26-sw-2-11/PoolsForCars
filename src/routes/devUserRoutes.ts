import express from 'express';

export const devUserRoutes = express.Router();

import * as fakeUserController from '../controllers/fake_user.controller.js';


devUserRoutes.get('/fake', fakeUserController.getFakeUser);
