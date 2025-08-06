interface MmValidationErrorOptions {
    code: string;
    message: string;
    dbName?: string | null;
    operation?: string;
    value?: any;
}

export class MmValidationError extends Error {
    code: string
    dbName: string | null
    operation: string | undefined
    value?: any;

    constructor(options: MmValidationErrorOptions) {
        super(options.message);

        this.name = 'MmValidationError';
        this.code = options.code;
        this.dbName = options.dbName || null;
        this.operation = options.operation;
        this.value = options.value;

        Error.captureStackTrace(this, MmValidationError);
    }
}