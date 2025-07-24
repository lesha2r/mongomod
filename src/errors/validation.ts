export class MmValidationError extends Error {
    code: string
    constructor(code: string, message: string, public dbName?: string | null) {
        super(message);

        this.name = 'MmValidationError';
        this.code = code;
        
        Error.captureStackTrace(this, MmValidationError);
    }
}