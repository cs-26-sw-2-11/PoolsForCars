import { type CalendarDay } from "./calendar_day.model.js";

export interface Week {
    startDate: Date;
    endDate: Date;
    days: Record<string, CalendarDay>;
}


