import { describe, expect, vi, beforeEach,test,afterEach,it } from 'vitest'
import * as uservices from "../../../services/users/user.service.js"
import * as controller from "../../../controllers/user.controller.js"
import type { Request, Response, NextFunction } from 'express'
import * as userModel from '../../../models/user.model.js';


let req: Partial<Request>;
let res: Partial<Response>;
let next: NextFunction;

// Mock all external dependencies
vi.mock("../../../services/users/user.service.js", () => ({
    loginService: vi.fn(),
    doSignup: vi.fn()
}))
vi.mock("../../../services/groups/group.service.js", () => ({
  makeNewGroups: vi.fn(),
}))
vi.mock("../../../models/user.model.js", () => ({
  updateUser: vi.fn(),
  readUsersJSON: vi.fn(),
  readUser: vi.fn(),
}))

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
    test.each<{ label: string; mockResolve: uservices.LoginResult; expected: number }>([
        {
            label: "correct login",
            mockResolve: { success: true as const, userId: 1 },
            expected: 200
        }, {
            label: "login with credentials not in db",
            mockResolve: { success: false, reason: "invalid_credentials" },
            expected: 401
        }
    ])
    ("returns $expected for $label", async ({ mockResolve, expected }) => {
        vi.mocked(uservices.loginService).mockResolvedValue(mockResolve);
        // await uservices.loginHandler(req as Request);
        await controller.loginHandler(req as Request, res as Response, next as NextFunction)
        expect(res.status).toHaveBeenCalledWith(expected);
    })

    // If it throws an error
    test('test for error', async () => {
        vi.mocked(uservices.loginService).mockRejectedValue(new Error("db error"));
        await controller.loginHandler(req as Request, res as Response, next as NextFunction);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
    })
});

describe("Signup controller", () => {
    it.each([
        {
            label: "successful signup",
            ableToCreateUser: true,
            Response: 200
        },{
            label: "duplicate user / db error",
            ableToCreateUser: false,
            Response: 401
        }
    ])
    ("returns $Response for $label", async ({ Response, ableToCreateUser }) => {
        if (!ableToCreateUser) {
        vi.mocked(uservices.doSignup).mockRejectedValue(new Error("db error"));
        await controller.signUp(req as Request, res as Response, next as NextFunction)
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        } else {
        await controller.signUp(req as Request, res as Response, next as NextFunction)
        expect(res.status).toHaveBeenCalledWith(Response)
        }
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
