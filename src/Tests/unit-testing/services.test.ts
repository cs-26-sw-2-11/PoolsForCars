import { describe, expect, vi, beforeEach,test,afterEach } from 'vitest'
import type { User } from '../../models/user.model'
import * as uservices from "../../services/user.service"
import * as gservices from "../../services/groups/group.service"
import * as controller from "../../controllers/user.controller"
import type { Request, Response, NextFunction } from 'express'


// Test clumbed together based on usage and functionality
describe('Login controller + services', () => {

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
        }
        next = vi.fn()
    })

    // Needed to cleanup vi.spyOn
    afterEach(() => {
        vi.restoreAllMocks()
    })

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
        // This is the structure for a one off test
        test('Test response for incorrect login', async () => {
            vi.spyOn(uservices, 'loginHandler').mockRejectedValue(new Error("db error"));
            await controller.loginHandling(req as Request, res as Response, next as NextFunction);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        })
    })
    
    describe("LoginHandler Service", () => {
        test.each([
            {
                label: "valid credentials",
                mockUser: { 0: { id: 0, lastName: "Johnsen", phoneNumber: "12345678" } },
                body: { lastName: "Johnsen", phone: "12345678" },
                expected: 0
            }, {
                label: "Empty body",
                mockUser: { 0: { id: 0, lastName: "Johnsen"} },
                body: {},
                expected: -1
            }, {
                label: "missing lastName or phone",
                mockUser: { 0: { id: 0, lastName: "Johnsen"} },
                body: { lastName: "Johnsen", phone: "12345678" },
                expected: -1
            }, {
                label: "getUsersService returns undefined",
                mockUsers: undefined,
                body: { lastName: "Johnsen", phone: "12345678" },
                expected: -1
            }, {
                label: "getUsersService returns empty object {}",
                mockUsers: {},
                body: { lastName: "Johnsen", phone: "12345678" },
                expected: -1
            }, {
                label: "Credentials with wrong case",
                mockUser: { 0: { id: 0, lastName: "Johnsen"} },
                body: { lastName: "johnsen", phone: "12345678" },
                expected: -1
            }]
        )
        (
            "returns $expected for $label", async ({ mockUser, body, expected}) => {
                vi.spyOn(uservices, 'getUsersService').mockResolvedValue(mockUser as any);
                // await uservices.loginHandler(req as Request);
                req.body = body;
                const result = await uservices.loginHandler(req as Request);
                expect(result).toBe(expected);
            }
        )
    })

/*
    // An example for a one off test
    test('Returns user id', async () => {
        vi.spyOn(uservices, 'getUsersService').mockResolvedValue({
            0: { id: 0, lastName: "Johnsen", phoneNumber: "12345678"} as Partial<User> as any,
        })
        // await uservices.loginHandler(req as Request);
        const result = await uservices.loginHandler(req as Request)
        expect(result).toBe(0)
    })
*/
})





