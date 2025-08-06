export class MmValidationError extends Error {
    code;
    dbName;
    operation;
    value;
    constructor(options) {
        super(options.message);
        this.name = 'MmValidationError';
        this.code = options.code;
        this.dbName = options.dbName || null;
        this.operation = options.operation;
        this.value = options.value;
        Error.captureStackTrace(this, MmValidationError);
    }
}
