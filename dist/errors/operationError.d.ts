interface MmOperationErrorOptions {
    code: string;
    message: string;
    dbName?: string | null;
    operation?: string;
    originalError?: any;
}
export declare class MmOperationError extends Error {
    code: string;
    dbName: string | null;
    operation: string | undefined;
    originalError: any | undefined;
    constructor(options: MmOperationErrorOptions);
}
export {};
