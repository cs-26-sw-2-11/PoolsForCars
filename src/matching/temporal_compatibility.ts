// Get all Users
// For each calender day of current user, compile a list of available drivers if their TOA is the same of earlier than the current user
// Calculate a temporal compatibility score with each driver on each day and sort the drivers according to this score.
// Create a summed temporal compatibility score for all respective drivers and sort the drivers according to this score.


import * as calenderModel from '../models/calendar.model.js';
import type { CalendarDay } from '../models/calendar_day.model.js';
import { convertToDayname, setCompatibility, sortCompatibilityAccumulator, type WeeklyCompatibilityIndex } from '../models/compatibility.model.js';
import { type User, type Users, readUsers } from '../models/user.model.js';


const tolerance: number = 30;

const calcLinearDecay = (toa1: string, toa2: string) => {
    const toa1Array: number[] = toa1.split(":").map(string => Number(string));
    const toa2Array: number[] = toa2.split(":").map(string => Number(string));

    const toaDiff: number =
        ((toa1Array[0] ?? 0) * 60 + (toa1Array[1] ?? 0)) -
        ((toa2Array[0] ?? 0) * 60 + (toa2Array[1] ?? 0));
    return Math.max(0, 1 - toaDiff / tolerance);
}

export const findEligbleDrivers = async (user: User): Promise<WeeklyCompatibilityIndex> => {
    let compatibilityMap: WeeklyCompatibilityIndex = {
        weeks: {},
        accumulator: {},
    };

    const users: Users = await readUsers();

    const todaysDate: Date = await calenderModel.getTodaysDate();
    const todaysWeek: number = await calenderModel.getTodaysWeek();

    for (const week of Object.entries(user.calendar)) {
        if (Number(week[0]) < todaysWeek) continue; // Skip current iteration if week is in the past

        for (let sub_user of users.values()) {
            if (user.id === sub_user.id) {
                continue;
            }
            if (!sub_user.calendar[Number(week[0])]) {
                continue;
            }

            for (const day of Object.entries(week[1].days)) {
                if (day[1].date.getDay() < todaysDate.getDay()) continue; // Skip current iteration if the day is in the past

                const userDay: CalendarDay = day[1];
                const subUserDay: CalendarDay = sub_user.calendar[Number(week[0])]?.days[day[0]] as CalendarDay;

                // both user and sub user wants to carpool on this day
                if (!(userDay.carpoolingIntent && subUserDay.carpoolingIntent)) {
                    continue;
                }

                // if user wants to drive on this day, only show compatible passengers
                if (userDay.carAvailability && subUserDay.carAvailability) {
                    continue;
                }

                // if user wants to be a passenger on this day, only show compatible drivers 
                if (!userDay.carAvailability && !subUserDay.carAvailability) {
                    continue;
                }


                const compatibility: number = calcLinearDecay(userDay.timeOfArrival, subUserDay.timeOfArrival);
                if (compatibility !== 0 && compatibility <= 1) {
                    setCompatibility(
                        compatibilityMap,
                        Number(week[0]),
                        convertToDayname(day[0]),
                        sub_user.id,
                        compatibility
                    );
                }
            }
        }
    }
    sortCompatibilityAccumulator(compatibilityMap);
    return compatibilityMap;
}
