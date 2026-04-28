//=== IMPORTS ===///
import express from 'express';
import { filePath } from "./index.js"
import { deleteUserById, updateUserById } from '../controllers/user.controller.js';


const router = express.Router();


router.route("")
    .get((req, res) => {
        res.sendFile(filePath + "/Profile.html");
    })


router.route("/:userId")
    .post((req, res)=> {
    })
    .put(
        // Add input validation to guarantee valid data is parsed through
        updateUserById)

    .delete(
        // Need to setup validation so it is impossible to delete others users.
        // add confirmation either front end or backend, preferably send from back end to front end.
        deleteUserById
    );


export default router;
