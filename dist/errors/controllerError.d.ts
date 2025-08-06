interface MmControllerErrorOptions {
    code: string;
    message: string;
    dbName?: string | null;
}
export declare class MmControllerError extends Error {
    code: string;
    dbName: string | null;
    constructor(options: MmControllerErrorOptions);
}
export {};
