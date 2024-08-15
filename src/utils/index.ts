import { EBsonType, TSchemaType } from "../types/schema.js";

export const getValueType = (value: any): TSchemaType | 'undefined' | undefined => {
    let output: TSchemaType | 'undefined' | undefined = undefined;

    if (value instanceof Object && value !== null) {
        if (Array.isArray(value)) return EBsonType.Array;
        if (value instanceof Date) return EBsonType.Date;

        output = EBsonType.Object;
    } else if (typeof(value) === 'string' || value instanceof String) {
        output = EBsonType.String;
    } else if (typeof(value) === 'number') {
        output = EBsonType.Number;
    } else if (value === null) {
        output = EBsonType.Null;
    } else if (typeof value === 'boolean') {
        output = EBsonType.Boolean;
    } else if (value === undefined) {
        output = 'undefined';
    }

    return output;
};

export const keyGenerate = (length = 16) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let secretPhrase = '';
  
    for (let i = 0; i < length; i++) {
      secretPhrase += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  
    return secretPhrase;
};