import { Router } from "express";
import * as path from 'path';


const router = Router();

//Gets the absolute path to our porjects HTML folder, based on
const filePath = path.resolve(process.cwd(), "src","PublicResources", "HTML");

// Needed if segmenting further for handling seperate files containing GET / POST requests
//router.use("/", login);



//Receives GET request and handles it, by serving a file using an absolute path.
router.get("/", (req, res) => {
    res.sendFile(filePath+"/Login.html");
})
router.get("/signup", (req, res) => {
    res.sendFile(filePath+"/Revisesignup.html");
})

export default router;