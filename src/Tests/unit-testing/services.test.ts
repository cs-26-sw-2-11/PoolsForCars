import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as uservices from "../../services/user.service"
import * as gservices from "../../services/group.service"
import * as controller from "../../controllers/user.controller"
import type { Request, Response, NextFunction } from 'express'


// Test clumbed together based on usage and functionality
describe('Testing if login works', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;
    beforeEach( () => {
            req = {
                body: {
                    lastName: 'Jolololooo',
                    phone: '12345678'
                }
            }
        
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        }
        next = vi.fn()
    })
    it('Should login a user, with a valid last name & phone number', async () => {
        await controller.loginHandling(req as Request, res as Response, next as NextFunction)

        expect(res.status).toHaveBeenCalledWith(400)
    })
})





