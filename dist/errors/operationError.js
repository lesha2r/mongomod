export class MmOperationError extends Error {
    code;
    dbName;
    operation;
    originalError;
    constructor(options) {
        super(options.message);
        this.name = 'MmOperationError';
        this.code = options.code;
        this.dbName = options.dbName || null;
        this.operation = options.operation;
        this.originalError = options.originalError || null;
        Error.captureStackTrace(this, MmOperationError);
    }
}
