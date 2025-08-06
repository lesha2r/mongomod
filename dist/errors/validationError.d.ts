interface MmValidationErrorOptions {
    code: string;
    message: string;
    dbName?: string | null;
    operation?: string;
    value?: any;
}
export declare class MmValidationError extends Error {
    code: string;
    dbName: string | null;
    operation: string | undefined;
    value?: any;
    constructor(options: MmValidationErrorOptions);
}
export {};
