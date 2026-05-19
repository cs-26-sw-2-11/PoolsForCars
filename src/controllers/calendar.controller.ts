import express from "express";

import * as userModel from '../models/user.model.js';
import * as weekModel from "../models/week.model.js";
import * as calendarModel from "../models/calendar.model.js";

// ───────────────────────────────────────────────────────────────
//  :::::: MAIN CRUD FUNCTIONS ::::::
// ───────────────────────────────────────────────────────────────

export const getCalendar = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user: userModel.User = await userModel.readUser(Number(req.params['userId']));
    const calendar: calendarModel.Calendar = calendarModel.readCalendar(user);
    res.status(200).json(calendar);
}

export const getCalendarWeek = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const user: userModel.User = await userModel.readUser(Number(req.params['userId']));
        const calendar: calendarModel.Calendar = calendarModel.readCalendar(user)

        const weekNumber: number = Number(req.params['weekNumber']);
        let week: weekModel.Week = await calendarModel.readWeek(calendar, weekNumber);

        if (typeof week === 'undefined') {
            week = await calendarModel.createWeek(calendar, weekNumber, user.schedule);
            userModel.updateUser(user.id, user);
        }

        res.status(200).json(week);
    } catch (err) {
        console.log(err);
    }
}

// export const updateCalendar = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
//     try {
//         const user: userModel.User = await userModel.readUser(Number(req.params['userId']));
//
//         const Calendar: calendarModel.Calendar = 
//
//         const weekNumber: number = Number(req.params['weekNumber']);
//         let week: weekModel.Week = await calendarModel.readWeek(calendar, weekNumber);
//
//         if (typeof week === 'undefined') {
//             week = await calendarModel.createWeek(calendar, weekNumber, user.schedule);
//             userModel.updateUser(user.id, user);
//         }
//
//         res.status(200).json(week);
//     } catch (err) {
//         console.log(err);
//     }
// }


// export const createWeek = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
//
// }
