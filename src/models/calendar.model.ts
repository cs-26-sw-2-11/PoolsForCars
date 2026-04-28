import { type User } from "./user.model.js";
import { type Week } from "./week.model.js";

export type Calendar = Record<number, Week>;


export const createWeek = async (calendar: Calendar, weekNumber: number, schedule: Week): Promise<Week> => {
    calendar[weekNumber] = JSON.parse(JSON.stringify(schedule));

    const weekDate: Date = await weekToDate(weekNumber);

    if (typeof calendar[weekNumber] !== 'undefined') {
        calendar[weekNumber].startDate = await getFirstDayOfWeek(weekDate);
        calendar[weekNumber].endDate = await getLastWorkdayOfWeek(weekDate);

        const tempDate: Date = new Date(calendar[weekNumber].startDate.valueOf());
        for (const day of Object.entries(calendar[weekNumber].days)) {
            day[1].date = new Date(tempDate.valueOf());
            tempDate.setDate(tempDate.getDate() + 1);
        }
    }


    return await readWeek(calendar, weekNumber);
}

export const readCalendar = (user: User): Calendar => {
    return user.calendar as Calendar;
}

export const readWeek = async (calendar: Calendar, weekNumber: number): Promise<Week> => {
    return calendar[weekNumber] as Week;
}


export const dateToWeek = async (date: Date): Promise<number> => {
    const tempDate: Date = new Date(date.valueOf()); // Copying date so the original date won't be modified

    const dayNum: number = (date.getDay() + 6) % 7; // ISO week date weeks start on Monday, so correct the day number
    tempDate.setDate(tempDate.getDate() - dayNum + 3); // Set the target to the nearest Thursday (current date + 4 - current day number)
    // ISO 8601 week number of the year for this date
    const firstThursday: number = tempDate.valueOf();

    // Set the target to the first day of the year
    tempDate.setMonth(0, 1); // First set the target to January 1st

    // If this is not a Thursday, set the target to the next Thursday
    if (tempDate.getDay() !== 4) {
        tempDate.setMonth(0, 1 + ((4 - tempDate.getDay()) + 7) % 7);
    }

    // The weeknumber is the number of weeks between the first Thursday of the year and the Thursday in the target week
    return 1 + Math.ceil((firstThursday - tempDate.valueOf()) / 604800000); // 604800000 = number of milliseconds in a week
}

export const weekToDate = async (weekNumber: number): Promise<Date> => {
    const firstDayOfYear: Date = new Date(Date.UTC(2026, 0, 1, 1));

    const daysInWeek: number = 7;
    const dayOffset: number = (weekNumber - 1) * daysInWeek;

    const date: Date = new Date(firstDayOfYear.getTime());
    date.setUTCDate(date.getUTCDate() + dayOffset);

    return date;
}

export const getFirstDayOfWeek = async (date: Date): Promise<Date> => {
    const dayNum: number = (date.getDay() + 6) % 7;
    const firstDay: Date = new Date(date);
    firstDay.setDate(date.getDate() - dayNum);
    return firstDay;
}

export const getLastWorkdayOfWeek = async (date: Date): Promise<Date> => {
    const dayNum: number = (date.getDay() + 6) % 7;
    const lastDay: Date = new Date(date);
    lastDay.setDate(date.getDate() + (4 - dayNum));
    return lastDay;
}
