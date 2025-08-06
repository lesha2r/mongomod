export class MmConnectionError extends Error {
    code;
    dbName;
    originalCode;
    originalError;
    constructor(options) {
        super(options.message);
        this.name = 'MmConnectionError';
        this.code = options.code;
        this.dbName = options.dbName || null;
        this.originalCode = options.originalError?.codeName || null;
        this.originalError = options.originalError || null;
        Error.captureStackTrace(this, MmConnectionError);
    }
}
