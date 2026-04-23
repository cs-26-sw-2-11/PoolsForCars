//=== IMPORTS ===///
import express from "express";
import { filePath } from "./index.js"
import { createUser } from "../controllers/user.controller.js";

const router = express.Router();



router.route("")
    .get((req, res) => {
        res.sendFile(filePath + "/Signup.html");
    })
    .post((req, res) =>{
        createUser
    });


export default router;
