//=== IMPORTS ===///
import express from "express";
import { filePath } from "./index.js"
import * as services from "../services/user.service.js"



const router = express.Router();



router.route("")
    .get((req, res) => {
        res.sendFile(filePath + "/Signup.html");
    })
    .post(
        [
         // Input validation / verification needed on form data. i.e. firstName, lastName, phone, and on subcatagories of preferences

        ],
        (req: express.Request, res:express.Response) =>{
        services.doSignup(req);
    });


export default router;
