import { MongomodErrCodes, MongomodErrMsgs } from "../../constants/mongomod.js";
import { MmValidationError } from "../../errors/validationError.js";
const throwCustomMethodError = (methodName) => {
    throw new MmValidationError({
        code: MongomodErrCodes.CustomMethodNotFunction,
        message: `${MongomodErrMsgs.CustomMethodNotFunction}: ${methodName}`,
    });
};
const throwCustomMethodErrorIfNeeded = (failedMethods) => {
    if (!failedMethods.length)
        return;
    throwCustomMethodError(failedMethods.join(', '));
};
function parseCustomMethods(customMethods) {
    const failedMethods = [];
    for (let [key, value] of Object.entries(customMethods || {})) {
        if (typeof value === 'function') {
            this[key] = value.bind(this);
        }
        else {
            failedMethods.push(key);
        }
    }
    throwCustomMethodErrorIfNeeded(failedMethods);
}
export default {
    parseCustomMethods
};
