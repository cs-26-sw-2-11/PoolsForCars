import { describe, expect, vi, beforeEach,test,afterEach,it } from "vitest"
import * as uservices from "../../../services/users/user.service.js"
import * as huservices from "../../../services/users/user.helper.service.js"
import * as userModel from "../../../models/user.model.js";


// Mock all external dependencies
vi.mock("../../../services/groups/group.service.js", () => ({
  makeNewGroups: vi.fn(),
}))
vi.mock("../../../models/user.model.js", () => ({
  updateUser: vi.fn(),
  readUsersJSON: vi.fn(),
  readUser: vi.fn(),
}))

describe("doUserExist", () => {
    it.each([
        {
            label: "no",
            mockDB: {
                0: {
                    firstName: "Jeff",
                    lastName: "Doe",
                    phoneNumber: "12345678",
                }
            },
            mockSignup: {
                id: 0,
                lastName: "josé",
                firstname: "eduardo",
                phoneNumber: "12345678",
            },
            expected: false,
        },{
            label: "yes",
            mockDB: {
                0: {
                    firstName: "Jeff",
                    lastName: "Doe",
                    phoneNumber: "12345678",
                }
            },
            mockSignup: {
                id: 0,
                firstName: "Jeff",
                lastName: "Doe",
                phoneNumber: "12345678",
            },
            expected: true,
        },{
            label: "error",
            mockDB: {
                0: {
                    firstName: "Jeff",
                    lastName: "Doe",
                    phoneNumber: "12345678",
                }
            },
            mockSignup: {
                id: 0,
                firstName: "Jeff",
                lastName: "Doe",
                phoneNumber: "12345678",
            },
            expected: true,
            doThrow: true,
        }
    ])("$label", async ({mockDB, mockSignup, expected, doThrow}) => {
        if(doThrow){
            vi.mocked(userModel.readUsersJSON).mockRejectedValue(new Error("db error"));
            await expect(huservices.doUserExist(mockSignup as unknown as userModel.User)).rejects.toThrow("db error");
        } else {
            vi.mocked(userModel.readUsersJSON).mockResolvedValue(mockDB as unknown as userModel.usersJSON);
            const result = await huservices.doUserExist(mockSignup as unknown as userModel.User)
            expect(result).toBe(expected);
        }
    })
})
