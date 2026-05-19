import express from "express"
import { body, validationResult } from "express-validator"

export const login = [
    body("lastName")
    .trim()
    .notEmpty().withMessage("Last name is required").bail()
    .isLength({ max: 20 }).withMessage("Last name too long").bail()
    .matches(/^[\p{L}]+(?:[ '-][\p{L}]+)*$/u).withMessage("Invalid Last name"),


    body("phoneNumber")
    .trim()
    .notEmpty().withMessage("Phone number is required").bail()
    .isLength({ max: 8 }).withMessage("Must be a danish phone number without +45").bail()
    .customSanitizer(value => value.replace(/\s/g, ""))
    .matches(/^\d{8}$/).withMessage("Phone must be 8 digits"),
];

/*
\p{L}]+ — one or more Unicode letters. \p{L} covers:

Latin (a-z, A-Z)
Accented characters (é, ü, ñ, ø, å)
Non-latin scripts (Arabic, Chinese, Cyrillic, Greek, etc.)


(?:[ '-][\p{L}]+)* — zero or more repetitions of a separator followed by more letters, where the separator can be:

  — a space (e.g. "Van Den")
' — an apostrophe (e.g. "O'Brien")
- — a hyphen (e.g. "Smith-Jones")
*/
export const signup = [
    body("firstName")
    .trim()
    .notEmpty().withMessage("First name is required").bail()
    .isLength({ max: 20 }).withMessage(" First name is too long").bail()
    .matches(/^[\p{L}]+(?:[ '-][\p{L}]+)*$/u).withMessage("Invalid First name").bail(),
    
    body("preferences")
    .notEmpty().bail()
    .isObject().withMessage("Wrong format?"),
]

// Function responsible for validating inputs. i.e. if if the body("lastName") the default route doesn't match 
// - the specifed specs, it returns an error, with the message send from the validation step. i.e. ("invalid name")
export const validate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next(); // continue only if valid
};