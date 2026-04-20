//=== IMPORTS ===///
import express from "express";
import * as path from 'path';
import { body, validationResult} from "express-validator"
import { filePath } from "./index.js"
import { readUsers, type User, type Users } from "../models/user.model.js"


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
        res.sendFile(filePath+"/Login.html");
    })
    .post(
    //=== FILTERS THE DATA AND MAKES SURE IT IS THE CORRECT FORMAT BY ONLY WHITELISTING CERTAIN CHARACTERS ===//
    // no clue why "/^[\p{L}]+(?:[ '-][\p{L}]+)*$/u" works, but chatgpt said its good.
    [
    body("lastName").trim().notEmpty().isLength({ min: 1, max: 20 }).matches(/^[\p{L}]+(?:[ '-][\p{L}]+)*$/u).withMessage("Invalid name"),
    body("phone").trim().notEmpty().matches(/^\d{2}( \d{2}){3}$/).withMessage("Phone must be 1-8 digits"),
    ], validate,
    (req: express.Request, res: express.Response) => {
    //=== TERMINATES THE REQUEST BY NOT RESPONDING IF DATA IS INCORRECT ===//
    // Collects the objects from the HTTP body
    const { lastName, phone } = req.body;

    // Console logs to ensure they match input
    console.log(` Last name: ${lastName} & Phone number: ${phone} `);
    
    const exists: Map = readUsers();
    console.log(exists)

    return res.json({ success: true });

})

export default router;