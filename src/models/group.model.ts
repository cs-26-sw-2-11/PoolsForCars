import type { Cost } from './cost.model.js';
import type { User } from './user.model.js';

export interface Group {
    id: number;
    rows: number;
    columns: number;
    row_labels: User[];
    column_labels: string[];
    values: Cost[][];
}

export const createGroup = (group: Group) => {
    // code to create group from database
};

export const readGroup = (group: Group) => {
    // code to read group from database
};

export const updateGroup = (group: Group) => {
    // code to update group from database
};

export const deleteGroup = (group: Group) => {
    // code to delete group from database
};
