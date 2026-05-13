import { describe, expect, vi, beforeEach,test,afterEach } from 'vitest'
import * as uservices from "../../services/user.service"
import * as controller from "../../controllers/user.controller"
import type { Request, Response, NextFunction } from 'express'
import * as userModel from '../../models/user.model.js';


let req: Partial<Request>;
let res: Partial<Response>;
let next: NextFunction;

// Sets the variables to be a specific value before each test.
beforeEach( () => {
    req = {
        body: {
            lastName: "Johnsen",
            phone: "12345678"
        },
        params:{
            userId: "1001",
        }
    }
    res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
        cookie: vi.fn().mockReturnThis()
    }
    next = vi.fn();
});

// Needed to cleanup vi.spyOn
afterEach(() => {
    vi.restoreAllMocks()
});

// Testing the 3 possible states for the login controller:
describe("Login controller", () => {
    test.each([
        {
            label: "Test response for correct login",
            mockResolve: 0,
            expected: 200
        }, {
            label: "Response to login with credentials not in database",
            mockResolve: -1,
            expected: 401
        }
    ])
    ("returns $expected for $label", async ({ mockResolve, expected }) => {
        vi.spyOn(uservices, 'loginHandler').mockResolvedValue(mockResolve as number);
        // await uservices.loginHandler(req as Request);
        await controller.loginHandling(req as Request, res as Response, next as NextFunction)
        expect(res.status).toHaveBeenCalledWith(expected);
    })

    // If it throws an error
    test('tests response for incorrect login', async () => {
        vi.spyOn(uservices, 'loginHandler').mockRejectedValue(new Error("db error"));
        await controller.loginHandling(req as Request, res as Response, next as NextFunction);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
    })
});

describe("Signup controller", () => {
    test.each([
        {
            label: "Valid data",
            ableToCreateUser: true,
            Response: 200
        },{
            label: "Invalid data / User already exists",
            ableToCreateUser: false,
            Response: 401
        }
    ])
    ("returns $Response for $label", async ({ ableToCreateUser, Response}) => {
        vi.spyOn(uservices, "doSignup").mockResolvedValue(ableToCreateUser as boolean);
        await controller.signUp(req as Request, res as Response, next as NextFunction)
        expect(res.status).toHaveBeenCalledWith(Response)
    })
    test("returns reponse for db signup error", async () => {
        vi.spyOn(uservices, "doSignup").mockRejectedValue(new Error("db error"));
        await controller.signUp(req as Request, res as Response, next as NextFunction)
        expect(next).toHaveBeenCalledWith(expect.any(Error));
    })
});

//describe("Create a user controller", () => {});

// Either not a controller or the helpet function needs to be moved here
//describe("Get all users from database", () => {});

/*describe("Get specific user by their id", () => {
    test.each([
        {   
            mockUser: {
                id: 1001,
                firstName: "ackles",
                lastName: "jensen",
                phoneNumber: 12345678,
            },
            expected: {
                firstName: "ackles",
                lastName: "jensen",
                phoneNumber: 12345678,
                id: 1001,
            },
            result: 200,
        }, {
            label: "",
            mockUser: {
                id: 1001,
                firstName: "ackles",
                lastName: "jensen",
                phoneNumber: 12345678,
            },
            expected: {
                firstName: "es",
                lastName: "jensen",
                phoneNumber: 12345678,
                id: 1001,
            },
            result: 401,
            failure: true,
        }
    ])("returns $response for $label", async ({ mockUser, expected, result, failure }) => {
    if(failure){
        vi.spyOn(userModel, "readUser").mockRejectedValue(new Error("Couldn't get user"));
        await controller.getUserById(req as Request, res as Response, next as NextFunction);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
    } else {
        vi.spyOn(userModel, "readUser").mockResolvedValue(mockUser as unknown as userModel.User);
        await controller.getUserById(req as Request, res as Response, next as NextFunction);
        expect(res.json).toHaveBeenCalledWith(expected);
        expect(res.status).toHaveBeenCalledWith(result);
    }
    })
    
    test("returns response for db error")

});*/

//describe("Get specific user by their id", () => {});
//describe("Get specific user by their id", () => {});


// Remember to update for later controllers.
