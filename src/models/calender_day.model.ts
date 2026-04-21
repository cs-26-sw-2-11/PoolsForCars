import type { Location } from  './location.model.js';

export interface CalenderDay {
    day: string;
    date: string;
    carAvailability: boolean;
    seatsOffered: number;
    carpoolingIntent: boolean;
    pickupPoint: Location;
    destination: Location;
    timeOfArrival: string;
    groups: [number | null, number | null];
}
