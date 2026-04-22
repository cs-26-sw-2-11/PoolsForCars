//=== IMPORTS ===///
import express from 'express';
import { filePath } from "./index.js"

const router = express.Router();


router.route("")
    .get((req, res) => {
        res.sendFile(filePath + "/Profile.html");
    });


export default router;
