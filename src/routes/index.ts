//=== IMPORTS ===///
import express from "express";
import * as path from 'path';
import { body, validationResult } from "express-validator";
import loginRoutes from "./login_router.js";
import signupRoutes from "./signupRoutes.js";
import profileRoutes from "./profileRoutes.js";
import { userRoutes } from "./userRoutes.js";
import { devUserRoutes } from "./devUserRoutes.js";
import calendarRoutes from "./calendarRoutes.js";
import groupRoutes from "./groupRoutes.js";
import { profile } from "console";



//=====VARIABLES=====//



const router = express.Router();
//Gets the absolute path to our porjects HTML folder, based on
export const filePath = path.resolve(process.cwd(), "src", "PublicResources", "HTML");


/*  Needed if segmenting further for handling seperate files containing GET / POST requests
    router.use("/", login);
*/

// Need POST, UPDATE & DELETE request handlers.

//=== POST REQUEST ===//
router.use('/login', loginRoutes);
router.use('/signup', signupRoutes);
router.use('/users', userRoutes);
router.use('/calendar', calendarRoutes);
router.use('/profile', profileRoutes);
router.use('/groups', groupRoutes);

router.use('/dev/users', devUserRoutes);

//=== GET REQUESTS ===//
//Receives GET request and handles it, by serving a file using an absolute path.
router.get("/", (req, res) => {
    res.sendFile(filePath + "/Login.html");
})
router.get("/signup", (req, res) => {
    res.sendFile(filePath + "/Revisesignup.html");
})

export default router;
