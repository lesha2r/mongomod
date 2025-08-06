export declare const validateDbInstance: (db: any) => void;
export declare const validateSchema: (schema: any) => void;
export declare const ensureMethodNameIsNotReserved: (methodName: string) => void;
export declare const validateCustomMethods: (customs?: {
    [key: string]: unknown;
}) => true | undefined;
