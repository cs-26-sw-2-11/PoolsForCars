import type { Cost } from './cost.model.js';
export interface Group {
    id: number;
    rows: number;
    columns: number;
    row_labels: [number, number];
    column_labels: string[];
    values: Cost[][];
}
export declare const createGroup: (group: Group) => void;
export declare const readGroup: (group: Group) => void;
export declare const updateGroup: (group: Group) => void;
export declare const deleteGroup: (group: Group) => void;
//# sourceMappingURL=group.model.d.ts.map