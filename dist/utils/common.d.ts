export declare const delay: (ms: number) => Promise<unknown>;
export declare const filterObject: (obj: {
    [key: string]: any;
}, allowedKeys: string[]) => {
    [k: string]: any;
};
