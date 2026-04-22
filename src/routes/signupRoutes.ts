//=== IMPORTS ===///
import express from "express";
import { body, validationResult } from "express-validator"
import { filePath } from "./index.js"


const router = express.Router();



router.route("")
    .get((req, res) => {
        res.sendFile(filePath + "/Signup.html");
    });


export default router;
