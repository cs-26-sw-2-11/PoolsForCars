import type { Location } from  './location.model.js';

export interface CalendarDay {
    // day: string;
    date: Date;
    carAvailability: boolean;
    seatsOffered: number;
    carpoolingIntent: boolean;
    pickupPoint: Location;
    destination: Location;
    timeOfArrival: string;
    groups: [number | null, number | null];
}

