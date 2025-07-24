import Schema from 'validno'
import { MongomodConnectionOptions } from '../MongoConnection.js';
import { MmValidationError } from '../errors/validation.js';
import { ConnectErrCodes, ConnectErrMsgs } from '../constants/connection.js';

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
        throw new MmValidationError(
            ConnectErrCodes.InvalidOptions,
            `${ConnectErrMsgs.InvalidOptions}: ${err.message}`,
            options?.dbName || null
        )
    }

    if (validationResult.ok === true) return true;

    throw new MmValidationError(
        ConnectErrCodes.InvalidOptions,
        `${ConnectErrMsgs.InvalidOptions}: ${validationResult.joinErrors()}`,
        options?.dbName || null
    )
}

export const validateConnectCallback = (callback?: Function) => {
    if (callback === undefined) return true;
    if (typeof callback === 'function') return true;

    throw new MmValidationError(
        ConnectErrCodes.ConnectCallbackFunction,
        ConnectErrMsgs.ConnectCallbackFunction,
        null
    );
}