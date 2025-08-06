interface MmConnectionErrorOptions {
    code: string;
    message: string;
    dbName?: string | null;
    originalError?: any;
}

export class MmConnectionError extends Error {
    code: string
    dbName: string | null
    originalCode: string | null
    originalError: any | null
    
    constructor(options: MmConnectionErrorOptions) {
        super(options.message);

        this.name = 'MmConnectionError';
        this.code = options.code;
        this.dbName = options.dbName || null;
        this.originalCode = options.originalError?.codeName || null;
        this.originalError = options.originalError || null;
        
        Error.captureStackTrace(this, MmConnectionError);
    }
}