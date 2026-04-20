// ====== TYPES ======
type UserId = string;        // stored as string keys
type WeekNumber = string;    // stored as string keys

type DayName =
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday";

type CompatibilityScore = number;

// userId --> compatibility
type UserCompatibilityMap = Record<UserId, CompatibilityScore>;

// day --> (user --> compatibility)
type DayCompatibilityMap = Record<DayName, UserCompatibilityMap>;

// week --> (day --> ...)
type WeekCompatibilityMap = Record<WeekNumber, DayCompatibilityMap>;

export interface WeeklyCompatibilityIndex {
    weeks: WeekCompatibilityMap;
    accumulator: UserCompatibilityMap;
    sortedAccumulator?: [number, number][];
}

// ====== HELPERS ======

// Ensure a week exists
function ensureWeek(
    store: WeeklyCompatibilityIndex,
    week: number
): DayCompatibilityMap {
    const weekKey = String(week);

    if (!store.weeks[weekKey]) {
        store.weeks[weekKey] = {
            Monday: {},
            Tuesday: {},
            Wednesday: {},
            Thursday: {},
            Friday: {},
        };
    }

    return store.weeks[weekKey];
}


// Ensure a week exists
function ensureUserAccumulator(
    store: WeeklyCompatibilityIndex,
    user: number
): UserCompatibilityMap {
    const userKey = String(user);

    if (!store.accumulator[userKey]) {
        store.accumulator[userKey] = 0;
    }

    return store.accumulator;
}

// ====== WRITE ======
export function setCompatibility(
    store: WeeklyCompatibilityIndex,
    week: number,
    day: DayName,
    userId: number,
    score: number
) {
    const weekData = ensureWeek(store, week);
    const userAccumulatorData = ensureUserAccumulator(store, userId);

    const userKey = String(userId);
    weekData[day][userKey] = score;
    userAccumulatorData[userKey] = score;
}

// ====== READ ======
export function getCompatibility(
    store: WeeklyCompatibilityIndex,
    week: number,
    day: DayName,
    userId: number
): number | undefined {
    const weekKey = String(week);
    const userKey = String(userId);

    return store.weeks[weekKey]?.[day]?.[userKey];
}

export function convertToDayname(day: string) {
    return day as DayName;
}


// ====== SORT ======
export function sortCompatibilityAccumulator(store: WeeklyCompatibilityIndex) {
    store.sortedAccumulator = Object.entries(store.accumulator)
        .map(([k, v]) => [Number(k), v] as [number, number])
        .sort((a, b) => a[1] - b[1]);
}
