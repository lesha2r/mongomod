interface MmConnectionErrorOptions {
    code: string;
    message: string;
    dbName?: string | null;
    originalError?: any;
}
export declare class MmConnectionError extends Error {
    code: string;
    dbName: string | null;
    originalCode: string | null;
    originalError: any | null;
    constructor(options: MmConnectionErrorOptions);
}
export {};
