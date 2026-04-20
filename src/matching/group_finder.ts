import type { CalenderDay } from "../models/calender_day.model.js";
import type { WeeklyCompatibilityIndex } from "../models/compatibility.model.js";
import { initUsers, readUser, readUsers, type User, type Users } from "../models/user.model.js";
import type { Week } from "../models/week.model.js";
import { findEligbleDrivers } from "./temporal_compatibility.js";

await initUsers()

const users: Users = await readUsers();
const user: User = users.get(0) as User;

const compatibility: WeeklyCompatibilityIndex = await findEligbleDrivers(user);
console.log(compatibility);

export const findGroups = async (user: User) => {
    for (let weekNumber in user.calender) {
        const week: Week = user.calender[weekNumber] as Week;
        for (let dayString in week.days) {
            const day: CalenderDay = week.days[dayString] as CalenderDay;
            for (let candidate of compatibility.sortedAccumulator ?? []) {
                testGroup(user, await readUser(candidate[0]));

            }
        }
    }
}

const testGroup = (user: User, candidate: User) => {
    if (candidate.calender[week][day]) {

    }


}
