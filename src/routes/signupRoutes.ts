//=== IMPORTS ===///
import express from "express";
import { filePath } from "./index.js"
import * as services from "../services/user.service.js"
import * as controller from "../controllers/user.controller.js"



const router = express.Router();



router.route("")
    .get((req, res) => {
        res.sendFile(filePath + "/Signup.html");
    })
    .post(
        [
        // Input validation / verification needed on form data. i.e. firstName, lastName, phone, and on subcategories of preferences
        // Don't know how to do it on subcategories tho 🤷‍♂️
        ],
        (req: express.Request, res:express.Response, next: express.NextFunction) =>{
        // calls the service responsible for the signup, should probably be moved to a controller function instead of a body function.
        controller.signUp(req, res, next);
    });


export default router;
