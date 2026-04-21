// ====== IMPORTS ======
import type { Cost } from './cost.model.js';

import * as fs from 'fs';
import { asyncAppendLineToFile, asyncReadFile, asyncWriteFile, DATABASE_DIRNAME } from '../database/helper-functions.js'

// ====== TYPES ======
export interface Group {
    id: number;
    rows: number;
    columns: number;
    row_labels: [number, [number, number]][];
    column_labels: number[];
    values: Cost[][];
    route: number[];
}

export type Groups = Map<number, Group>;

interface GroupMeta {
    lastId: number;
}

// ====== CONFIG ======
export const GROUPS_FILE: string = "groups/groups.ndjson";
const META_FILE: string = "groups/meta.json";

// ====== IN-MEMORY STATE ======
const GROUPS = new Map<number, Group>() as Groups;
let meta: GroupMeta;

// ====== WRITE QUEUE ======
let groupWriteQueue: Promise<any> = Promise.resolve();
const enqueue = <T>(task: () => Promise<T>): Promise<T> => {
    groupWriteQueue = groupWriteQueue.then(task, task); // handle the rejected callback properly or something
    return groupWriteQueue;
}

// ====== INIT (load from disk) ======;
export const initGroups = async (): Promise<void> => {
    // Load meta-data
    if (fs.existsSync(DATABASE_DIRNAME + META_FILE)) {
        try {
            const metaString: string = await asyncReadFile(META_FILE);
            if (metaString.length !== 0) {
                meta = JSON.parse(metaString) as GroupMeta;
            } else {
                meta = { lastId: 0 } as GroupMeta;
            }
        } catch (error) {
            console.warn("Something went wrong, trying to initialize the groups", error);
        }
    }

    // Load groups
    if (fs.existsSync(DATABASE_DIRNAME + GROUPS_FILE)) {
        try {
            const groups: string = await asyncReadFile(GROUPS_FILE);

            const parsedGroups: Group[] = groups
                .split("\n")
                .filter(line => line.trim() !== "")
                .map(line => JSON.parse(line)) as Group[];

            parsedGroups.forEach(group => {
                GROUPS.set(group.id, group);
            });
        } catch (error) {
            console.warn("Something went wrong, trying to initialize the groups", error);
        }
    }
}


// ====== CREATE GROUP (SAFE) ======
export const createGroup = async (group: Group): Promise<Group> => {
    return enqueue(async () => {
        group.id = meta.lastId++;

        // update memory
        GROUPS.set(group.id, group);

        // append to file
        await asyncAppendLineToFile(GROUPS_FILE, JSON.stringify(group));

        // persist meta
        await asyncWriteFile(META_FILE, JSON.stringify(meta))

        return group;
    })
}

// ====== READ GROUP ======
export const readGroup = async (id: number): Promise<Group> => {
    try {
        return GROUPS.get(id) as Group;
    } catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};

// ====== UPDATE GROUP ======
export const updateGroup = async (id: number, updated_group: Group): Promise<void> => {
    return enqueue(async () => {
        // update memory
        GROUPS.set(id, updated_group);

        // update file
        await writeGroups(GROUPS);
    })
};

// ====== DELETE GROUP ======
export const deleteGroup = async (id: number): Promise<void> => {
    return enqueue(async () => {
        // update memory
        GROUPS.delete(id);

        // update file
        await writeGroups(GROUPS);
    })
};

// ====== WRITE GROUPS ======
export const writeGroups = async (groups: Groups): Promise<void> => {
    try {
        await asyncWriteFile(GROUPS_FILE, "");
        for (const key of groups.keys()) {
            await asyncAppendLineToFile(GROUPS_FILE, JSON.stringify(groups.get(key)));
        }
    } catch (error) {
        console.log(error);
        throw error; // TODO: handle it properly
    }
};

// ====== READ GROUPS ======
export const readGroups = async (): Promise<Groups> => {
    try {
        const groups: string = await asyncReadFile(GROUPS_FILE);

        if (groups.length == 0) {
            throw "No Groups";
        }

        const parsedGroups: Group[] = groups 
            .split("\n")
            .filter(line => line.trim() !== "")
            .map(line => JSON.parse(line)) as Group[];

        const mapGroups: Groups = new Map<number, Group>(
            parsedGroups.map(group => [
                group.id,
                group
            ])
        );
        return mapGroups;
    } catch (error) {
        if (error == "No Groups") {
            return new Map<number, Group>;
        }
        console.log(error);
        throw error; // TODO: handle it properly
    }
};
