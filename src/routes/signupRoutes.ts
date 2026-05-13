//=== IMPORTS ===///
import express from "express";
import { filePath } from "./index.js"
import * as services from "../services/user.service.js"
import * as controller from "../controllers/user.controller.js"
import * as validate from "../Validators/formValidators.js";


const router = express.Router();



router.route("")
    .get((req, res) => {
        res.sendFile(filePath + "/Signup.html");
    })
    .post(
        validate.login, validate.signup, validate.validate,
        (req: express.Request, res:express.Response, next: express.NextFunction) =>{
        // calls the service responsible for the signup, should probably be moved to a controller function instead of a body function.
        //controller.createUser(req, res, next);
        controller.signUp(req, res, next);
    });


export default router;
