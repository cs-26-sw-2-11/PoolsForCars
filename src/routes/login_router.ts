//=== IMPORTS ===///
import express from "express";
import { body, validationResult } from "express-validator"
import { filePath } from "./index.js"
import { getUsers, loginHandling } from "../controllers/user.controller.js";



const router = express.Router();

// Function responsible for validating inputs. i.e. if if the body("lastName") the default route doesn't match 
// - the specifed specs, it returns an error, with the message send from the validation step. i.e. ("invalid name")
export const validate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next(); // continue only if valid
};

// Default route for /login, can be setup to handle the specific requests like .delete, .post, .put, etc.
router.route("")
    // If get request, respond by sending a file, using an absolute filepath
    .get((req, res) => {
        res.sendFile(filePath + "/Login.html");
    })
    .post(
        [
            body("lastName").trim().notEmpty().isLength({ min: 1, max: 20 }).matches(/^[\p{L}]+(?:[ '-][\p{L}]+)*$/u).withMessage("Invalid name"),
            body("phoneNumber").trim().notEmpty().customSanitizer(value => value.replace(/\s/g, "")).matches(/^\d{8}$/).withMessage("Phone must be 8 digits"),
        ], validate,
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
        })

export default router;
