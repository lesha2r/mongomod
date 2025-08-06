import { MongomodErrCodes, MongomodErrMsgs } from "../../constants/mongomod.js";
import { MmValidationError } from "../../errors/validationError.js";
import MongoModel from "../MongoModel.js";

const throwCustomMethodError = (methodName: string) => {
    throw new MmValidationError({
        code: MongomodErrCodes.CustomMethodNotFunction,
        message: `${MongomodErrMsgs.CustomMethodNotFunction}: ${methodName}`,
    });
}

const throwCustomMethodErrorIfNeeded = (failedMethods: string[]) => {
    if (!failedMethods.length) return

    throwCustomMethodError(failedMethods.join(', '));
}

function parseCustomMethods(this: MongoModel, customMethods: Record<string, any> | undefined) {
    // Check custom methods and throw if any are not functions
    const failedMethods = []
    
    for (let [key, value] of Object.entries(customMethods || {})) {
        if (typeof value === 'function') {
            this[key] = value.bind(this);
        } else {
            failedMethods.push(key);
        }
    }

    throwCustomMethodErrorIfNeeded(failedMethods);
}

export default {
    parseCustomMethods
}