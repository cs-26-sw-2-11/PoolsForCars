//=== IMPORTS ===///
import express from "express";
import { body, validationResult } from "express-validator"
import { filePath } from "./index.js"
import { readUsers, type User, type Users } from "../models/user.model.js"
import { getUsers, loginHandling } from "../controllers/user.controller.js";
import { loginHandler } from "../services/user.service.js";


const router = express.Router();

export const validate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //console.log(errors);
        return res.status(400).json({ errors: errors.array() });
    }
    next(); // continue only if valid
};

router.route("")
    .get((req, res) => {
        res.sendFile(filePath + "/Login.html");
    })
    .post(
        [
            body("lastName").trim().notEmpty().isLength({ min: 1, max: 20 }).matches(/^[\p{L}]+(?:[ '-][\p{L}]+)*$/u).withMessage("Invalid name"),
            body("phone").trim().notEmpty().customSanitizer(value => value.replace(/\s/g, "")).matches(/^\d{8}$/).withMessage("Phone must be 8 digits"),
        ], validate,
        (req: express.Request, res: express.Response, next: express.NextFunction) => {
            //=== TERMINATES THE REQUEST BY NOT RESPONDING IF DATA IS INCORRECT ===//
            // Collects the objects from the HTTP body


        const handler = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                await loginHandling(req, res, next);
                return res.json({ success: true });
            } catch (err) {
                return next(err);
            }
        };
            // Console logs to ensure they match input
            // console.log(` Last name: ${lastName} & Phone number: ${phone} `);
        })

export default router;
