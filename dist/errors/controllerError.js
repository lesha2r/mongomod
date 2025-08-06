export class MmControllerError extends Error {
    code;
    dbName;
    constructor(options) {
        super(options.message);
        this.name = 'MmControllerError';
        this.code = options.code;
        this.dbName = options.dbName || null;
        Error.captureStackTrace(this, MmControllerError);
    }
}
