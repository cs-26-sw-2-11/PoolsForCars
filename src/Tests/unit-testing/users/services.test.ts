import { describe, expect, vi, beforeEach, test, afterEach, it } from "vitest";
import * as uservices from "../../../services/users/user.service.js";
import * as huservices from "../../../services/users/user.helper.service.js";
import type { Request } from "express";
import * as userModel from "../../../models/user.model.js";
import * as groupService from "../../../services/groups/group.service.js";
import * as express from "express";

// Mock all external dependencies
vi.mock("../../../services/users/user.helper.service.js", () => ({
    doUserExist: vi.fn(),
    createUser: vi.fn(),
    unpackUser: vi.fn(),
}));
vi.mock("../../../services/groups/group.service.js", () => ({
    makeNewGroups: vi.fn(),
}));
vi.mock("../../../models/user.model.js", () => ({
    updateUser: vi.fn(),
    readUsersJSON: vi.fn(),
    readUser: vi.fn(),
}));

// Test clumbed together based on usage and functionality
describe("", () => {
    // Responsible for login
    describe("", () => {
        // makes the necessary input variables available
        let req: Partial<Request>;

        // Sets the variables to be a specific value before each test.
        beforeEach(() => {
            req = {
                body: {},
            };
        });

        // Needed to cleanup vi.spyOn
        afterEach(() => {
            vi.restoreAllMocks();
        });

        describe("Login Service", () => {
            test.each([
                {
                    label: "user with id: 0",
                    mockUser: {
                        0: {
                            id: 0,
                            lastName: "Johnsen",
                            phoneNumber: "12345678",
                        },
                    },
                    body: { lastName: "Johnsen", phoneNumber: "12345678" },
                    expected: { success: true, userId: 0 },
                },
                {
                    label: "Empty body",
                    mockUser: { 0: { id: 0, lastName: "Johnsen" } },
                    body: {},
                    expected: { success: false, reason: "invalid_credentials" },
                },
                {
                    label: "missing lastName or phone",
                    mockUser: { 0: { id: 0, lastName: "Johnsen" } },
                    body: { lastName: "Johnsen", phoneNumber: "12345678" },
                    expected: { success: false, reason: "invalid_credentials" },
                },
                {
                    label: "User database returns undefined",
                    mockUser: undefined,
                    body: { lastName: "Johnsen", phoneNumber: "12345678" },
                    expected: new Error("Empty db"),
                    lever: true,
                },
                {
                    label: "Userdatabase returns empty object {}",
                    mockUser: {},
                    body: { lastName: "Johnsen", phoneNumber: "12345678" },
                    expected: new Error("Empty db"),
                    lever: true,
                },
                {
                    label: "Credentials with wrong case",
                    mockUser: { 0: { id: 0, lastName: "Johnsen" } },
                    body: { lastName: "johnsen", phoneNumber: "12345678" },
                    expected: { success: false, reason: "invalid_credentials" },
                },
            ])(
                "returns $expected for $label",
                async ({ mockUser, body, expected, lever }) => {
                    vi.mocked(userModel.readUsersJSON).mockResolvedValue(
                        mockUser as userModel.usersJSON,
                    );
                    // await uservices.loginHandler(req as Request);
                    if (!lever) {
                        req.body = body;
                        const result = await uservices.loginService(
                            req.body.lastName,
                            req.body.phoneNumber,
                        );
                        expect(result).toStrictEqual(expected);
                    } else {
                        await expect(uservices.loginService).rejects.toThrow(
                            expected,
                        );
                    }
                },
            );
        });
    });

    describe("", () => {
        describe("doSignup", () => {
            // Inputs for the tested function can be empty,
            // since the outputs are mocked for the function calls it makes
            const req = {} as unknown;

            const fakeUser = { id: "1", phoneNumber: "12345678" };
            const fakeNewUser = {
                id: "1",
                phoneNumber: "12345678",
                driverInGroups: [],
            };
            const fakeGroups = [{ id: "g1" }];

            beforeEach(() => {
                vi.clearAllMocks();
            });

            it("creates a new user when they do not exist", async () => {
                // Arrange
                vi.mocked(huservices.unpackUser).mockResolvedValue(
                    fakeUser as unknown as userModel.User,
                );
                vi.mocked(huservices.doUserExist).mockResolvedValue(false);
                vi.mocked(huservices.createUser).mockResolvedValue(
                    fakeNewUser as unknown as userModel.User,
                );
                vi.mocked(groupService.makeNewGroups).mockResolvedValue(
                    fakeGroups as unknown as number[],
                );
                vi.mocked(userModel.updateUser).mockResolvedValue(undefined);

                // Act
                await uservices.doSignup(
                    req as string,
                    req as string,
                    req as string,
                    req as huservices.userPreferences,
                );

                // Assert
                expect(huservices.doUserExist).toHaveBeenCalledWith(fakeUser);
                expect(huservices.createUser).toHaveBeenCalledWith(fakeUser);
                expect(groupService.makeNewGroups).toHaveBeenCalledWith(
                    fakeUser,
                );
                expect(userModel.updateUser).toHaveBeenCalledWith("1", {
                    ...fakeNewUser,
                    driverInGroups: fakeGroups,
                });
            });

            it("throws when the user already exists", async () => {
                // Arrange
                vi.mocked(huservices.unpackUser).mockResolvedValue(
                    fakeUser as unknown as userModel.User,
                );
                vi.mocked(huservices.doUserExist).mockResolvedValue(true);

                // Act
                const result = await uservices.doSignup(
                    req as string,
                    req as string,
                    req as string,
                    req as huservices.userPreferences,
                );

                // Assert
                expect(result).toBe("Phone_Number_Taken");
                expect(huservices.createUser).not.toHaveBeenCalled();
            });

            it("propagates errors from createUser", async () => {
                vi.mocked(huservices.unpackUser).mockResolvedValue(
                    fakeUser as unknown as userModel.User,
                );
                vi.mocked(huservices.doUserExist).mockResolvedValue(false);
                vi.mocked(huservices.createUser).mockRejectedValue(
                    new Error("DB failure"),
                );

                await expect(
                    uservices.doSignup(
                        req as string,
                        req as string,
                        req as string,
                        req as huservices.userPreferences,
                    ),
                ).rejects.toThrow("DB failure");
            });
        });
    });

    describe("updateUserInfoById", () => {
        const User = {
            id: "1",
            phoneNumber: "12345678",
            firstName: "John",
            lastName: "Smith",
            lookingForGroups: true,
        };
        beforeEach(() => {
            vi.clearAllMocks();
        });

        it("updates an existing user with matching information", async () => {
            // Arrange
            const firstName = "John";
            const lastName = "Smith";
            const phoneNumber = "12345678";
            const lookingForGroups = true;
            const userId = "1";
            vi.mocked(userModel.readUser).mockResolvedValue(
                User as unknown as userModel.User,
            );

            // Act
            const result = await uservices.updateUserInfoById(
                firstName,
                lastName,
                phoneNumber,
                lookingForGroups,
                userId,
            );

            // Assert
            expect(userModel.readUser).toHaveBeenCalledWith(1);
            expect(result).toBe(false);
        });

        it("updates an existing user with new information", async () => {
            // Arrange
            const firstName = "Smith";
            const lastName = "John";
            const phoneNumber = "87654321";
            const lookingForGroups = true;
            const userId = "1";

            vi.mocked(userModel.readUser).mockResolvedValue(
                User as unknown as userModel.User,
            );

            // Act
            const result = await uservices.updateUserInfoById(
                firstName,
                lastName,
                phoneNumber,
                lookingForGroups,
                userId,
            );

            // Assert
            expect(userModel.readUser).toHaveBeenCalledWith(1);
            expect(userModel.updateUser).toHaveBeenCalledWith(
                1,
                expect.objectContaining({
                    phoneNumber: "87654321",
                    firstName: "Smith",
                    lastName: "John",
                    lookingForGroups: true,
                }),
            );
            expect(result).toBe(true);
        });
    });
});

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
