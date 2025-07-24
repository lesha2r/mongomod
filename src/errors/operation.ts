export class MmOperationError extends Error {
    code: string

    constructor(
        code: string,
        message: string,
        public dbName?: string | null,
        public operation?: string
    ) {
        super(message);

        this.name = 'MmOperationError';
        this.code = code;
        this.operation = operation;
        
        Error.captureStackTrace(this, MmOperationError);
    }
}
