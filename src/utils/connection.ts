import Schema from 'validno'
import { MongomodConnectionOptions } from '../MongoConnection/index.js';
import { MmValidationError } from '../errors/validationError.js';
import { MmConnectionErrCodes, MmConnectionErrMsgs } from '../constants/connection.js';

const connectionOptionsSchema = new Schema({
    link: {type: String},
    login: {type: String},
    password: {type: String},
    dbName: {type: String},
    srv: {type: Boolean, required: false},
})

export const validateOptions = (options: MongomodConnectionOptions) => {
    let validationResult;

    try {
        validationResult = connectionOptionsSchema.validate(options || {})
    } catch (err: any) {
        throw new MmValidationError({
            code: MmConnectionErrCodes.InvalidOptions,
            message: `${MmConnectionErrMsgs.InvalidOptions}: ${err.message}`,
            dbName: options?.dbName || null
        })
    }

    if (validationResult.ok === true) return true;

    throw new MmValidationError({
        code: MmConnectionErrCodes.InvalidOptions,
        message: `${MmConnectionErrMsgs.InvalidOptions}: ${validationResult.joinErrors()}`,
        dbName: options?.dbName || null
    })
}

export const validateConnectCallback = (callback?: Function) => {
    if (callback === undefined) return true;
    if (typeof callback === 'function') return true;

    throw new MmValidationError({
        code: MmConnectionErrCodes.ConnectCallbackFunction,
        message: MmConnectionErrMsgs.ConnectCallbackFunction,
        dbName: null
    });
}