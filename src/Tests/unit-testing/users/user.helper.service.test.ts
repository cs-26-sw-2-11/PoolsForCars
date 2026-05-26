import { describe, expect, vi, beforeEach, test, afterEach, it } from "vitest";
import * as uservices from "../../../services/users/user.service.js";
import * as huservices from "../../../services/users/user.helper.service.js";
import * as userModel from "../../../models/user.model.js";
import { error } from "node:console";

// Mock all external dependencies
vi.mock("../../../services/groups/group.service.js", () => ({
    makeNewGroups: vi.fn(),
}));
vi.mock("../../../models/user.model.js", () => ({
    updateUser: vi.fn(),
    readUsersJSON: vi.fn(),
    readUser: vi.fn(),
}));

describe("doUserExist", () => {
    it("no", async () => {
        const mockDB = {
            0: { firstName: "Jeff", lastName: "Doe", phoneNumber: "12345678" },
        };
        const mockSignup = {
            id: 0,
            lastName: "josé",
            firstname: "eduardo",
            phoneNumber: "12345678",
        };

        vi.mocked(userModel.readUsersJSON).mockResolvedValue(
            mockDB as unknown as userModel.usersJSON,
        );
        const result = await huservices.doUserExist(
            mockSignup as unknown as userModel.User,
        );
        expect(result).toBe(false);
    });

    it("yes", async () => {
        const mockDB = {
            0: { firstName: "Jeff", lastName: "Doe", phoneNumber: "12345678" },
        };
        const mockSignup = {
            id: 0,
            firstName: "Jeff",
            lastName: "Doe",
            phoneNumber: "12345678",
        };

        vi.mocked(userModel.readUsersJSON).mockResolvedValue(
            mockDB as unknown as userModel.usersJSON,
        );
        const result = await huservices.doUserExist(
            mockSignup as unknown as userModel.User,
        );
        expect(result).toBe(true);
    });

    it("error", async () => {
        const mockSignup = {
            id: 0,
            firstName: "Jeff",
            lastName: "Doe",
            phoneNumber: "12345678",
        };

        vi.mocked(userModel.readUsersJSON).mockRejectedValue(new Error("yes"));
        await expect(
            huservices.doUserExist(mockSignup as unknown as userModel.User),
        ).rejects.toThrow(new Error("something went wrong"));
    });

    it("empty db exception", async () => {
        const mockSignup = {
            id: 0,
            firstName: "Jeff",
            lastName: "Doe",
            phoneNumber: "12345678",
        };

        vi.mocked(userModel.readUsersJSON).mockRejectedValue(
            new Error("no users found"),
        );
        await expect(
            huservices.doUserExist(mockSignup as unknown as userModel.User),
        ).resolves.toBe(false);
    });
});
