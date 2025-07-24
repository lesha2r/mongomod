export class MmConnectionError extends Error {
    code: string
    originalCode: string | null
    
    constructor(
        code: string,
        message: string,
        public dbName?: string | null,
        originalError?: any
    ) {
        super(message);

        this.name = 'MmConnectionError';
        this.code = code;
        this.originalCode = originalError?.codeName || null;
        
        Error.captureStackTrace(this, MmConnectionError);
    }
}