//=== IMPORTS ===///
import express from "express";
import * as path from 'path';
import { body, validationResult} from "express-validator";
import login from "./login_router.js";



//=====VARIABLES=====//



const router = express.Router();
//Gets the absolute path to our porjects HTML folder, based on
export const filePath = path.resolve(process.cwd(), "src","PublicResources", "HTML");


/*  Needed if segmenting further for handling seperate files containing GET / POST requests
    router.use("/", login);
*/

// Need POST, UPDATE & DELETE request handlers.

//=== POST REQUEST ===//
router.use('/login', login);



//=== GET REQUESTS ===//
//Receives GET request and handles it, by serving a file using an absolute path.
router.get("/", (req, res) => {
    res.sendFile(filePath+"/Login.html");
})
router.get("/signup", (req, res) => {
    res.sendFile(filePath+"/Revisesignup.html");
})

export default router;