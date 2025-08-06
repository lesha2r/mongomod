interface MmControllerErrorOptions {
    code: string;
    message: string;
    dbName?: string | null;
}

export class MmControllerError extends Error {
    code: string
    dbName: string | null
    
    constructor(options: MmControllerErrorOptions,) {
        super(options.message);

        this.name = 'MmControllerError';
        this.code = options.code;
        this.dbName = options.dbName || null;
        
        Error.captureStackTrace(this, MmControllerError);
    }
}