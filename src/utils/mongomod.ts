import MongoSchema from "../MongoSchema/index.js";
import MongoConnection from "../MongoConnection/index.js";

import { MmMethodNames } from "../constants/model.js";
import { MmValidationError } from "../errors/validationError.js";
import { MongomodErrCodes, MongomodErrMsgs } from "../constants/mongomod.js";

export const validateDbInstance = (db: any) => {
    if (db instanceof MongoConnection === false) {
        throw new MmValidationError({
            code: MongomodErrCodes.WrongInstance,
            message: MongomodErrMsgs.WrongInstance,
        });
    }
}

export const validateSchema = (schema: any) => {
    if (schema === null || schema === undefined) return
    if (schema instanceof MongoSchema === false) {
        throw new MmValidationError({
            code: MongomodErrCodes.WrongSchema,
            message: MongomodErrMsgs.WrongSchema,
        });
    }
}

export const ensureMethodNameIsNotReserved = (methodName: string) => {
    if ((MmMethodNames as ReadonlyArray<string>).includes(methodName)) {
        throw new MmValidationError({
            code: MongomodErrCodes.ReservedMethodName,
            message: `${MongomodErrMsgs.ReservedMethodName}: ${methodName}`,
        });
    }
}

export const validateCustomMethods = (customs?: {[key: string]: unknown}) => {
    if (customs === null || customs === undefined) return true;
    
    if (typeof customs !== 'object' || Array.isArray(customs)) {
        throw new MmValidationError({
            code: MongomodErrCodes.CustomMethodInvalidated,
            message: `${MongomodErrMsgs.CustomMethodInvalidated}`
        })
    }


    const failedMethods: string[] = []
    const failedReserved: string[] = []
    const reservedMethods = MmMethodNames as ReadonlyArray<string>;

    Object.entries(customs).forEach(([key, value]) => {
        if (reservedMethods.includes(key)) failedReserved.push(key);
        if (typeof value !== 'function') failedMethods.push(key);
    });

    if (failedReserved.length > 0) {
        throw new MmValidationError({
            code: MongomodErrCodes.ReservedMethodName,
            message: `${MongomodErrMsgs.ReservedMethodName}: ${failedReserved.join(',')}`
        })
    }

    if (failedMethods.length > 0) {
        throw new MmValidationError({
            code: MongomodErrCodes.CustomMethodNotFunction,
            message: `${MongomodErrMsgs.CustomMethodNotFunction}: ${failedMethods.join(',')}`
        })
    }
}