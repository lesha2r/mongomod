import MongoSchema from "../MongoSchema.js";
import MongoConnection from "../MongoConnection.js";
import { MmMethodsNames } from "../constants/methods.js";
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
    if (schema !== null && schema instanceof MongoSchema === false) {
        throw new MmValidationError({
            code: MongomodErrCodes.WrongSchema,
            message: MongomodErrMsgs.WrongSchema,
        });
    }
}

export const ensureMethodNameIsNotReserved = (methodName: string) => {
    if ((MmMethodsNames as ReadonlyArray<string>).includes(methodName)) {
        throw new MmValidationError({
            code: MongomodErrCodes.ReservedMethodName,
            message: `${MongomodErrMsgs.ReservedMethodName}: ${methodName}`,
        });
    }
}