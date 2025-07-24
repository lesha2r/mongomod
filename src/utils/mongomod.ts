import MongoSchema from "../MongoSchema.js";
import MongoConnection from "../MongoConnection.js";
import { MmMethodsNames } from "../constants/methods.js";
import { MmValidationError } from "../errors/validation.js";
import { MongomodErrorCodes, MongomodErrorMessages } from "../constants/mongomod.js";

export const validateDbInstance = (db: any) => {
    if (db instanceof MongoConnection === false) {
        throw new MmValidationError(
            MongomodErrorCodes.WrongInstance,
            MongomodErrorMessages.WrongInstance,
        );
    }
}

export const validateSchema = (schema: any) => {
    if (schema !== null && schema instanceof MongoSchema === false) {
        throw new MmValidationError(
            MongomodErrorCodes.WrongSchema,
            MongomodErrorMessages.WrongSchema,
        );
    }
}

export const ensureMethodNameIsNotReserved = (methodName: string) => {
    if ((MmMethodsNames as ReadonlyArray<string>).includes(methodName)) {
        throw new MmValidationError(
            MongomodErrorCodes.ReservedMethodName,
            `${MongomodErrorMessages.ReservedMethodName}: ${methodName}`,
        );
    }
}