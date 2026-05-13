import { describe, expect, vi, beforeEach,test,afterEach } from 'vitest'
import * as uservices from "../../services/user.service"
import * as controller from "../../controllers/user.controller"
import type { Request, Response, NextFunction } from 'express'
import * as userModel from '../../models/user.model.js';



// Test clumbed together based on usage and functionality

describe("User services", () => {

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

    
    
    describe("LoginHandler Service", () => {
        test.each([
            {
                label: "valid credentials",
                mockUser: { 0: { id: 0, lastName: "Johnsen", phoneNumber: "12345678" } },
                body: { lastName: "Johnsen", phoneNumber: "12345678" },
                expected: 0
            }, {
                label: "Empty body",
                mockUser: { 0: { id: 0, lastName: "Johnsen"} },
                body: {},
                expected: -1
            }, {
                label: "missing lastName or phone",
                mockUser: { 0: { id: 0, lastName: "Johnsen"} },
                body: { lastName: "Johnsen", phoneNumber: "12345678" },
                expected: -1
            }, {
                label: "getUsersService returns undefined",
                mockUsers: undefined,
                body: { lastName: "Johnsen", phoneNumber: "12345678" },
                expected: -2
            }, {
                label: "getUsersService returns empty object {}",
                mockUsers: {},
                body: { lastName: "Johnsen", phoneNumber: "12345678" },
                expected: -2
            }, {
                label: "Credentials with wrong case",
                mockUser: { 0: { id: 0, lastName: "Johnsen"} },
                body: { lastName: "johnsen", phoneNumber: "12345678" },
                expected: -1
            }]
        )
        ("returns $expected for $label", async ({ mockUser, body, expected}) => {
            vi.spyOn(uservices, 'getUsersService').mockResolvedValue(mockUser as any);
            // await uservices.loginHandler(req as Request);
            req.body = body;
            const result = await uservices.loginHandler(req as Request);
            expect(result).toBe(expected);
        })


    })
})

// Responsible for DB
describe("DB user.service", () => {
    describe("User db", () => {
        test.each([
            {
                label: "User in db",
                mockDB: {
                    id: 0,
                    user: {
                        firstName: "Jeff",
                        lastName: "Doe",
                        phoneNumber: 12345678,
                    }
                },
                mockSignup: {
                    id: 0,
                    lastName: "josé",
                    firstname: "eduardo",
                    phoneNumber: 12345678,
                },
                expected: false,
            },{
                label: "User already exists in db",
                mockDB: {
                    id: 0,
                    user: {
                        firstName: "Jeff",
                        lastName: "Doe",
                        phoneNumber: 12345678,
                    }
                },
                mockSignup: {
                    id: 0,
                    firstName: "Jeff",
                    lastName: "Doe",
                    phoneNumber: 12345678,
                },
                expected: true,
            },{
                label: "User already exists in db",
                mockDB: {
                    id: 0,
                    user: {
                        firstName: "Jeff",
                        lastName: "Doe",
                        phoneNumber: 12345678,
                    }
                },
                mockSignup: {
                    id: 0,
                    firstName: "Jeff",
                    lastName: "Doe",
                    phoneNumber: 12345678,
                },
                expected: true,
                doThrow: true,
            }
        ])("$label", async ({mockDB, mockSignup, expected, doThrow}) => {
            if(doThrow){
                vi.spyOn(uservices, "getUsersService").mockRejectedValue(new Error("db error"));
                await expect(uservices.doUserExist(mockSignup as unknown as userModel.User)).rejects.toThrow("db error");
            } else {
                vi.spyOn(uservices, "getUsersService").mockResolvedValue(mockDB);
                const result = await uservices.doUserExist(mockSignup as unknown as userModel.User)
                expect(result).toBe(expected);
            }
    })
})
})

// Responsible for signup
describe("", () => {
    // makes the necessary input variables available
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;
    let mockUser: Partial<userModel.User>

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
                createdUser: true
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

    describe("Unpack user", () => {
        test.each([
            /*{
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
                    firstName: 'John',
                    lastName: 'Doe',
                    phoneNumber: '12345678',
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
            },*/{
                label: "Invalid or missing data",
                    mockUser: {
                    id: 0,
                    firstName: "Joe",
                    lastName: "Doe",
                    phoneNumber: "12345678",
                },
                toThrow: true,
            }

        ])("$label",async ({mockUser, toThrow, /*mockedUser*/}) => {
            req.body = mockUser;
            if(toThrow){
                await expect(uservices.unpackUser(req as Request)).rejects.toThrow("invalid user data")
            } else{/*

            const user: userModel.User = await uservices.unpackUser(req as Request);
                //console.log(JSON.stringify(user, null, 10));
            expectTypeOf({user}).toEqualTypeOf<{mockedUser}>()
            //expect(user).toBe(mockedUser);*/
            }

        })
    })
})
})









/*
test('Returns user id', async () => {
        vi.spyOn(uservices, 'getUsersService').mockResolvedValue({
            0: { id: 0, lastName: "Johnsen", phoneNumber: "12345678"} as Partial<User> as any,
        })
        // await uservices.loginHandler(req as Request);
        const result = await uservices.loginHandler(req as Request)
        expect(result).toBe(0)
    })
*/
//describe ("Database services", () => {})




