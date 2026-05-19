import { describe, expect, vi, beforeEach,test,afterEach,it } from "vitest"
import * as uservices from "../../../services/users/user.service.js"
import * as huservices from "../../../services/users/user.helper.service.js"
import * as controller from "../../../controllers/user.controller.js"
import type { Request, Response, NextFunction } from "express"
import * as userModel from "../../../models/user.model.js";
import * as groupModel from "../../../models/group.model.js"
import * as groupService from "../../../services/groups/group.service.js";
import * as express from "express"


// Mock all external dependencies
vi.mock("../../../services/users/user.helper.service.js", () => ({
  doUserExist: vi.fn(),
  createUser: vi.fn(),
  unpackUser: vi.fn(),
}))
vi.mock("../../../services/groups/group.service.js", () => ({
  makeNewGroups: vi.fn(),
}))
vi.mock("../../../models/user.model.js", () => ({
  updateUser: vi.fn(),
  readUsersJSON: vi.fn(),
  readUser: vi.fn(),
}))



// Test clumbed together based on usage and functionality
describe("", () => {

// Responsible for login
describe("", () => {
    // makes the necessary input variables available
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    // Sets the variables to be a specific value before each test.
    beforeEach( () => {
        req = {
            body: {
            }
        }

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
            send: vi.fn().mockReturnThis(),
        }
        next = vi.fn()
    })

    // Needed to cleanup vi.spyOn
    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe("Login Service", () => {
        test.each([
            {
                label: "user with id: 0",
                mockUser: { 0: { id: 0, lastName: "Johnsen", phoneNumber: "12345678" } },
                body: { lastName: "Johnsen", phoneNumber: "12345678" },
                expected: { success: true, userId: 0 }
            }, {
                label: "Empty body",
                mockUser: { 0: { id: 0, lastName: "Johnsen"} },
                body: {},
                expected: { success: false, reason: "invalid_credentials" }
            }, {
                label: "missing lastName or phone",
                mockUser: { 0: { id: 0, lastName: "Johnsen"} },
                body: { lastName: "Johnsen", phoneNumber: "12345678" },
                expected: { success: false, reason: "invalid_credentials" }
            }, {
                label: "User database returns undefined",
                mockUser: undefined,
                body: { lastName: "Johnsen", phoneNumber: "12345678" },
                expected: new Error("Empty db"),
                lever: true
            }, {
                label: "Userdatabase returns empty object {}",
                mockUser: {},
                body: { lastName: "Johnsen", phoneNumber: "12345678" },
                expected: new Error("Empty db"),
                lever: true
            }, {
                label: "Credentials with wrong case",
                mockUser: { 0: { id: 0, lastName: "Johnsen"} },
                body: { lastName: "johnsen", phoneNumber: "12345678" },
                expected: { success: false, reason: "invalid_credentials" }
            }]
        )
        ("returns $expected for $label", async ({ mockUser, body, expected, lever }) => {
            vi.mocked(userModel.readUsersJSON).mockResolvedValue(mockUser as any);
            // await uservices.loginHandler(req as Request);
            if(!lever){
            req.body = body;
            const result = await uservices.loginService(req.body.lastName, req.body.phoneNumber);
            expect(result).toStrictEqual(expected);
            } else {
            await expect(uservices.loginService).rejects.toThrow(expected)
            }
        })
    })
})
/*
// Responsible for DB

})
*/
// Responsible for signup
describe("", () => {
    /*
    // makes the necessary input variables available
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    // Sets the variables to be a specific value before each test.
    beforeEach( () => {
        req = {
            body: {
                firstName: "huq",
                lastName: "Johnsen",
                phone: "12345678"
            }
        }

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
            send: vi.fn().mockReturnThis(),
            cookie: vi.fn().mockReturnThis()
        }
        next = vi.fn()
    })

    // Needed to cleanup vi.spyOn
    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe("Main signup function", () => {
        test.each([
            {
                label: "User does not exist",
                mockUser: {
                    id: 0,
                    firstName: "John",
                    lastName: "Doe",
                    phoneNumber: "12345678",
                    "preferences": {
                        "Monday": {
                          "day": "Mondy",
                          "carAvailability": "wohwfih",
                          "seatsOffered": 3,
                          "carpoolingIntent": true,
                          "pickupPoint": "123 Main Street",
                          "destination": "456 Work Avenue",
                          "timeOfArrival": "08:30"
                        }
                    }
                },
                expected: false,
                createdUser: true,
            },{
                label: "User does exist",
                    mockUser: {
                    id: 0,
                    firstName: "John",
                    lastName: "Doe",
                    phoneNumber: "12345678",
                    "preferences": {
                        "Monday": {
                          "carAvailability": "wohwfih",
                          "seatsOffered": 3,
                          "carpoolingIntent": true,
                          "pickupPoint": "123 Main Street",
                          "destination": "456 Work Avenue",
                          "timeOfArrival": "08:30"
                        }
                    }
                },
                expected: true,
                createdUser: false,
            }
        ])
        ("returns $createdUser for $label", async ({mockUser, expected, createdUser}) => {
        req.body = mockUser;
        vi.spyOn(uservices, "unpackUser").mockResolvedValue(mockUser as unknown as userModel.User);
        //vi.spyOn(uservices, "loginHandler").mockResolvedValue(expected as number);
        vi.spyOn(uservices, "doUserExist").mockResolvedValue(expected);
        vi.spyOn(userModel, "createUser").mockResolvedValue(mockUser as unknown as userModel.User);
        vi.spyOn(groupService, "makeNewGroups").mockResolvedValue();
        vi.spyOn()
        const result = await uservices.doSignup(req as Request);
        expect(result).toBe(createdUser);
        //expect(() => uservices.doSignup(req as Request)).toThrow("invalid user data");
        })

        test("parses invalid data to signup", async () => {
            vi.spyOn(uservices, "unpackUser").mockRejectedValue(new Error("invalid user data"));
            await expect(uservices.doSignup(req as Request)).rejects.toThrow("invalid user data");
        })

        test("Duplicate users found when trying to create user", async () => {
            vi.spyOn(uservices, "unpackUser").mockResolvedValue(req.body);
            vi.spyOn(uservices, "doUserExist").mockRejectedValue(new Error("duplicate users"));
            await expect(uservices.doSignup(req as Request)).rejects.toThrow("duplicate users");
        })
    })
*/
    describe("doSignup", () => {
      const mockReq = {} as express.Request

      const fakeUser = { id: "1", phoneNumber: "12345678" };
      const fakeNewUser = { id: "1", phoneNumber: "12345678", driverInGroups: [] };
      const fakeGroups = [{ id: "g1" }];

      beforeEach(() => {
        vi.clearAllMocks();
      })

      it("creates a new user when they do not exist", async () => {
        // Arrange
        vi.mocked(huservices.unpackUser).mockResolvedValue(fakeUser as unknown as userModel.User);
        vi.mocked(huservices.doUserExist).mockResolvedValue(false);
        vi.mocked(huservices.createUser).mockResolvedValue(fakeNewUser as unknown as userModel.User);
        vi.mocked(groupService.makeNewGroups).mockResolvedValue(fakeGroups as unknown as number[]);
        vi.mocked(userModel.updateUser).mockResolvedValue(undefined);

        // Act
        await uservices.doSignup(mockReq);

        // Assert
        expect(huservices.doUserExist).toHaveBeenCalledWith(fakeUser);
        expect(huservices.createUser).toHaveBeenCalledWith(fakeUser);
        expect(groupService.makeNewGroups).toHaveBeenCalledWith(fakeUser);
        expect(userModel.updateUser).toHaveBeenCalledWith("1", {
          ...fakeNewUser,
          driverInGroups: fakeGroups,
        });
      })

      it("throws when the user already exists", async () => {
        // Arrange
        vi.mocked(huservices.unpackUser).mockResolvedValue(fakeUser as unknown as userModel.User);
        vi.mocked(huservices.doUserExist).mockResolvedValue(true);

        // Act & Assert
        await expect(uservices.doSignup(mockReq)).rejects.toThrow("Something went wrong");
        expect(huservices.createUser).not.toHaveBeenCalled();
      })

      it("propagates errors from createUser", async () => {
        vi.mocked(huservices.unpackUser).mockResolvedValue(fakeUser as unknown as userModel.User);
        vi.mocked(huservices.doUserExist).mockResolvedValue(false);
        vi.mocked(huservices.createUser).mockRejectedValue(new Error("DB failure"));

        await expect(uservices.doSignup(mockReq)).rejects.toThrow("DB failure");
      })
    })
})

describe("updateUserInfoById",() => {
        const User = { id: "1", phoneNumber: "12345678", firstName: "John", lastName: "Smith", lookingForGroups: true };
    beforeEach(() => {
        vi.clearAllMocks();
    })
    
    it("updates an existing user with matching information", async () => {
        // Arrange
        const UserMatch = {
            body: { id: "1", phoneNumber: "12345678", firstName: "John", lastName: "Smith", lookingForGroups: true },
            params: { userId: "1" }
        } as unknown as express.Request;
        vi.mocked(userModel.readUser).mockResolvedValue(User as any as userModel.User);

        // Act
        const result = await uservices.updateUserInfoById(UserMatch);

        // Assert
        expect(userModel.readUser).toHaveBeenCalledWith(1)
        expect(result).toBe(-1);
        })

        it("updates an existing user with new information", async () => {
        // Arrange
        const UserMismatch = {
            body: { id: "1", phoneNumber: "87654321", firstName: "John", lastName: "Smith", lookingForGroups: true },
            params: { userId: "1" }
        } as unknown as express.Request;
        vi.mocked(userModel.readUser).mockResolvedValue(User as any as userModel.User);

        // Act
        const result = await uservices.updateUserInfoById(UserMismatch);

        // Assert
        expect(userModel.readUser).toHaveBeenCalledWith(1)
        expect(userModel.updateUser).toHaveBeenCalledWith(1, expect.objectContaining({
            phoneNumber: "87654321",
            firstName: "John",
            lastName: "Smith",
            lookingForGroups: true,
        }))
        expect(result).toBe(1);

        })
    })

    



/*
    describe("Unpack user", () => {
        test.each([
            {
                label: "Valid data",
                    mockUser: {
                    id: 0,
                    firstName: "John",
                    lastName: "Doe",
                    phoneNumber: "12345678",
                    "preferences": {
                        "Monday": {
                          "carAvailability": "wohwfih",
                          "seatsOffered": 3,
                          "carpoolingIntent": true,
                          "pickupPoint": "123 Main Street",
                          "destination": "456 Work Avenue",
                          "timeOfArrival": "08:30"
                        }
                    }
                },
                mockedUser: {
                    id: 0,
                    firstName: "John",
                    lastName: "Doe",
                    phoneNumber: "12345678",
                    schedule: {
                      startDate: "2026-05-05T09:48:14.042Z",
                      endDate: "2026-05-05T09:48:14.042Z",
                      days: [Object]
                    },
                    calendar: {},
                    lookingForGroups: false,
                    driverInGroups: [],
                    passengerInGroups: []
                }
            },*//*{
                label: "Invalid or missing data",
                    mockUser: {
                    id: 0,
                    firstName: "Joe",
                    lastName: "Doe",
                    phoneNumber: "12345678",
                },
                toThrow: true,
            }

        ])("$label",async ({mockUser, toThrow, /*mockedUser*//*}) => {
            req.body = mockUser;
            if(toThrow){
                await expect(uservices.unpackUser(req as Request)).rejects.toThrow("invalid user data")
            } else{/*

            const user: userModel.User = await uservices.unpackUser(req as Request);
                //console.log(JSON.stringify(user, null, 10));
            expectTypeOf({user}).toEqualTypeOf<{mockedUser}>()
            //expect(user).toBe(mockedUser);*//*
            }

        })
    })
})*/
})












/*
test("Returns user id", async () => {
        vi.spyOn(uservices, "getUsersService").mockResolvedValue({
            0: { id: 0, lastName: "Johnsen", phoneNumber: "12345678"} as Partial<User> as any,
        })
        // await uservices.loginHandler(req as Request);
        const result = await uservices.loginHandler(req as Request)
        expect(result).toBe(0)
    })
*/
//describe ("Database services", () => {})




