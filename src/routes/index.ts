//=== IMPORTS ===///
import express from "express";
import * as path from 'path';
import { body, validationResult} from "express-validator"



//=====VARIABLES=====//

const router = express.Router();

//Gets the absolute path to our porjects HTML folder, based on
const filePath = path.resolve(process.cwd(), "src","PublicResources", "HTML");


const validate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    // return res.status(400).json({ errors: errors.array() });
  }
  next(); // continue only if valid
};
/*  Needed if segmenting further for handling seperate files containing GET / POST requests
    router.use("/", login);
*/

// Need POST, UPDATE & DELETE request handlers.

//=== POST REQUEST ===//

router.post("/login", 
    //=== FILTERS THE DATA AND MAKES SURE IT IS THE CORRECT FORMAT BY ONLY WHITELISTING CERTAIN CHARACTERS ===//
    // no clue why "/^[\p{L}]+(?:[ '-][\p{L}]+)*$/u" works, but chatgpt said its good.
    [
    body("lastName").trim().notEmpty().isLength({ min: 1, max: 20 }).matches(/^[\p{L}]+(?:[ '-][\p{L}]+)*$/u).withMessage("Invalid name"),
    body("phone").trim().notEmpty().matches(/^[0-9]{1,8}$/).withMessage("Phone must be 1-8 digits"),
    ], validate,
    (req: express.Request, res: express.Response) => {
    //=== TERMINATES THE REQUEST BY NOT RESPONDING IF DATA IS INCORRECT ===//

    // Collects the objects from the HTTP body
    const { lastName, phone } = req.body;

    // Console logs to ensure they match input
    console.log(` Last name: ${lastName} & Phone number: ${phone} `);
    return res.json({ success: true });

})


//=== GET REQUESTS ===//
//Receives GET request and handles it, by serving a file using an absolute path.
router.get("/", (req, res) => {
    res.sendFile(filePath+"/Login.html");
})
router.get("/signup", (req, res) => {
    res.sendFile(filePath+"/Revisesignup.html");
})

export default router;