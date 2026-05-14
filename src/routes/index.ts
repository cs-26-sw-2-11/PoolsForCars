//=== IMPORTS ===///
import express from "express";
import * as path from 'path';
import loginRoutes from "./login_router.js";
import signupRoutes from "./signupRoutes.js";
import profileRoutes from "./profileRoutes.js";
import { userRoutes } from "./userRoutes.js";
import { devUserRoutes } from "./devUserRoutes.js";
import calendarRoutes from "./calendarRoutes.js";
import groupRoutes from "./groupRoutes.js";
import notificationRoutes from "./notificationRoutes.js";


//=====VARIABLES=====//

// Needed for express to function, black box?
const router = express.Router();

//Gets the absolute path to our porjects HTML folder, based on
export const filePath = path.resolve(process.cwd(), "src", "PublicResources", "HTML");

//=== Request segmenter, filtering all '/name' request so google.dk/login/1 => routes to loginRoutes as /1 ===//
router.use('/login', loginRoutes);
router.use('/signup', signupRoutes);
router.use('/users', userRoutes);
router.use('/calendar', calendarRoutes);
router.use('/profile', profileRoutes);
router.use('/groups', groupRoutes);
router.use('/notifications', notificationRoutes);

router.use('/dev/users', devUserRoutes);

//=== GET REQUESTS ===//
//Receives GET request and handles it, by serving a file using an absolute path.
router.get("/", (req, res) => {
    res.sendFile(filePath + "/Login.html");
})



export default router;
