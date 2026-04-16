import { type CalenderDay } from "./calender_day.model.js";

export interface Week {
    weekNumber: number;
    dateSpan: string;
    days: [CalenderDay, CalenderDay, CalenderDay, CalenderDay, CalenderDay];
}
