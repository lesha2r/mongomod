import Schema from 'validno';
import { MmValidationError } from '../errors/validationError.js';
import { MmConnectionErrors } from '../constants/connection.js';
const connectionOptionsSchema = new Schema({
    link: { type: String },
    login: { type: String },
    password: { type: String },
    dbName: { type: String },
    srv: { type: Boolean, required: false },
});
export const validateOptions = (options) => {
    let validationResult;
    try {
        validationResult = connectionOptionsSchema.validate(options || {});
    }
    catch (err) {
        throw new MmValidationError({
            code: MmConnectionErrors.InvalidOptions.code,
            message: `${MmConnectionErrors.InvalidOptions.message}: ${err.message}`,
            dbName: options?.dbName || null
        });
    }
    if (validationResult.ok === true)
        return true;
    throw new MmValidationError({
        code: MmConnectionErrors.InvalidOptions.code,
        message: `${MmConnectionErrors.InvalidOptions.message}: ${validationResult.joinErrors()}`,
        dbName: options?.dbName || null
    });
};
export const validateConnectCallback = (callback) => {
    if (callback === undefined)
        return true;
    if (typeof callback === 'function')
        return true;
    throw new MmValidationError({
        code: MmConnectionErrors.ConnectCallbackFunction.code,
        message: MmConnectionErrors.ConnectCallbackFunction.message,
        dbName: null
    });
};
