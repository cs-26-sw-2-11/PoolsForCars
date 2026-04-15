export interface Meta {
    lastUserId: number;
}

export const createMeta = async (): Promise<Meta> => {
    return {
        lastUserId: 0
    } as Meta;
}
