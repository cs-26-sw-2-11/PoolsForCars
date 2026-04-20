// Get all Users
// For each calender day of current user, compile a list of available drivers if their TOA is the same of earlier than the current user
// Calculate a temporal compatibility score with each driver on each day and sort the drivers according to this score.
// Create a summed temporal compatibility score for all respective drivers and sort the drivers according to this score.


import type { CalenderDay } from '../models/calender_day.model.js';
import { convertToDayname, setCompatibility, sortCompatibilityAccumulator, type WeeklyCompatibilityIndex } from '../models/compatibility.model.js';
import { type User, type Users, readUsers } from '../models/user.model.js';


const tolerance: number = 30;

const calcLinearDecay = (toa1: string, toa2: string) => {
    const toa1Array: number[] = toa1.split(":").map(string => Number(string));
    const toa2Array: number[] = toa2.split(":").map(string => Number(string));

    const toaDiff: number = Math.abs(
        ((toa1Array[0] ?? 0) * 60 + (toa1Array[1] ?? 0)) -
        ((toa2Array[0] ?? 0) * 60 + (toa2Array[1] ?? 0))
    );
    return Math.max(0, 1 - toaDiff / tolerance);
}

export const findEligbleDrivers = async (user: User): Promise<WeeklyCompatibilityIndex> => {
    let compatibilityMap: WeeklyCompatibilityIndex = {
        weeks: {},
        accumulator: {},
    };

    const users: Users = await readUsers();

    for (let week in user.calender) {
        for (let sub_user of users.values()) {
            if (user.id === sub_user.id) {
                continue;
            }
            if (!sub_user.calender[week]) {
                continue;
            }

            for (let day in user.calender[week]?.days) {
                const userDay: CalenderDay = user.calender[week].days[day] as CalenderDay;
                const subUserDay: CalenderDay = sub_user.calender[week].days[day] as CalenderDay;

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

                console.log(userDay, subUserDay);


                const compatibility: number = calcLinearDecay(userDay.timeOfArrival, subUserDay.timeOfArrival);
                if (compatibility !== 0) {
                    setCompatibility(
                        compatibilityMap,
                        Number(week),
                        convertToDayname(day),
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
