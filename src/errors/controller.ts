export class MmControllerError extends Error {
    code: string
    
    constructor(
        code: string,
        message: string,
        public dbName?: string | null,
    ) {
        super(message);

        this.name = 'MmControllerError';
        this.code = code;
        
        Error.captureStackTrace(this, MmControllerError);
    }
}