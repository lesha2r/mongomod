import MongoSchema from "../MongoSchema/index.js";
import MongoConnection from "../MongoConnection/index.js";
import { MmMethodNames } from "../constants/model.js";
import { MmValidationError } from "../errors/validationError.js";
import { MongomodErrors } from "../constants/mongomod.js";
export const validateDbInstance = (db) => {
    if (db instanceof MongoConnection === false) {
        throw new MmValidationError({
            code: MongomodErrors.WrongInstance.code,
            message: MongomodErrors.WrongInstance.message,
        });
    }
};
export const validateSchema = (schema) => {
    if (schema === null || schema === undefined)
        return;
    if (schema instanceof MongoSchema === false) {
        throw new MmValidationError({
            code: MongomodErrors.WrongSchema.code,
            message: MongomodErrors.WrongSchema.message,
        });
    }
};
export const ensureMethodNameIsNotReserved = (methodName) => {
    if (MmMethodNames.includes(methodName)) {
        throw new MmValidationError({
            code: MongomodErrors.ReservedMethodName.code,
            message: `${MongomodErrors.ReservedMethodName.message}: ${methodName}`,
        });
    }
};
export const validateCustomMethods = (customs) => {
    if (customs === null || customs === undefined)
        return true;
    if (typeof customs !== 'object' || Array.isArray(customs)) {
        throw new MmValidationError({
            code: MongomodErrors.CustomMethodInvalidated.code,
            message: `${MongomodErrors.CustomMethodInvalidated.message}`
        });
    }
    const failedMethods = [];
    const failedReserved = [];
    const reservedMethods = MmMethodNames;
    Object.entries(customs).forEach(([key, value]) => {
        if (reservedMethods.includes(key))
            failedReserved.push(key);
        if (typeof value !== 'function')
            failedMethods.push(key);
    });
    if (failedReserved.length > 0) {
        throw new MmValidationError({
            code: MongomodErrors.ReservedMethodName.code,
            message: `${MongomodErrors.ReservedMethodName.message}: ${failedReserved.join(',')}`
        });
    }
    if (failedMethods.length > 0) {
        throw new MmValidationError({
            code: MongomodErrors.CustomMethodNotFunction.code,
            message: `${MongomodErrors.CustomMethodNotFunction.message}: ${failedMethods.join(',')}`
        });
    }
};
