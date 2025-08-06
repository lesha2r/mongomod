interface MmOperationErrorOptions {
    code: string;
    message: string;
    dbName?: string | null;
    operation?: string;
    originalError?: any;
}

export class MmOperationError extends Error {
    code: string
    dbName: string | null
    operation: string | undefined
    originalError: any | undefined

    constructor(options: MmOperationErrorOptions) {
        super(options.message);

        this.name = 'MmOperationError';
        this.code = options.code;
        this.dbName = options.dbName || null;
        this.operation = options.operation;
        this.originalError = options.originalError || null;
        
        Error.captureStackTrace(this, MmOperationError);
    }
}
