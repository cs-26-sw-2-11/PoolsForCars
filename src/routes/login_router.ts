//=== IMPORTS ===///
import express from "express";
import * as validate from "../Validators/formValidators.js";
import { filePath } from "./index.js"
import { loginHandling } from "../controllers/user.controller.js";



const router = express.Router();



// Default route for /login, can be setup to handle the specific requests like .delete, .post, .put, etc.
router.route("")
    // If get request, respond by sending a file, using an absolute filepath
    .get((req, res) => {
        res.sendFile(filePath + "/Login.html");
    })
    .post(validate.login, validate.validate,
        (req: express.Request, res: express.Response, next: express.NextFunction) => {
            //=== TERMINATES THE REQUEST BY NOT RESPONDING IF DATA IS INCORRECT ===//
            // Collects the objects from the HTTP body
        const handler = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                await loginHandling(req, res, next);
            } catch (err) {
                return next(err);
            }
        };
        handler(req,res,next);
            // Console logs to ensure they match input
            // console.log(` Last name: ${lastName} & Phone number: ${phone} `);
        }
    )

export default router;
