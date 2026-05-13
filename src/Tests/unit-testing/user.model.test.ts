import { describe, expect, vi, beforeEach,test,afterEach } from 'vitest'
import { fs, vol } from 'memfs'
import * as uservices from "../../services/user.service"
import * as controller from "../../controllers/user.controller"
import type { Request, Response, NextFunction } from 'express'
import * as userModel from '../../models/user.model.js';
import { asyncReadFile } from '../../database/helper-functions.js'
import { join } from "path"

vi.mock('node:fs')
vi.mock('node:fs/promises')

beforeEach(() => {
  // reset the state of in-memory fs
  vol.reset()
})

const DATABASE_DIRNAME = "src/database/";

describe("Helper functions", () => {
    describe("", () => {
        test.each([
            {
                label: "async read file",
                file: "/meta.json",
                text: "1234"
            }
        ])("$label", async ({file, text}) => {
            const fullpath = join(DATABASE_DIRNAME, file);
            vol.mkdirSync(DATABASE_DIRNAME, {recursive: true});
            fs.writeFileSync(fullpath, text);

            const result = await asyncReadFile(file);
            expect(result).toBe(text);
        })
    })
    describe("", () => {
        test.each([
            {
                label: "async read file",
                file: "/meta.json",
                text: "1234"
            }
        ])("$label", async ({file, text}) => {
            const fullpath = join(DATABASE_DIRNAME, file);
            vol.mkdirSync(DATABASE_DIRNAME, {recursive: true});

            const result = await asyncReadFile(file);
            expect(result).toBe(text);
        })


    })



})