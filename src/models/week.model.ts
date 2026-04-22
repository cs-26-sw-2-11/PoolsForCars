import { type CalenderDay } from "./calender_day.model.js";

export interface Week {
    startDate: string;
    endDate: string;
    days: Record<string, CalenderDay>;
}

export type Calender = Record<number, Week>;
