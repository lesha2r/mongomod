import { MongoMethods } from '../constants/methods.js';
import { MmOperationErrCodes, MmOperationErrMsgs } from '../constants/operations.js';
import { MmOperationError } from '../errors/operationError.js';
import { MmValidationError } from '../errors/validationError.js';
import QueryResult from '../QueryResult.js';
import Schema, { validations } from 'validno';
const throwOperationError = (err, dbName) => {
    throw new MmOperationError({
        code: MmOperationErrCodes.OperationFailed,
        message: `${MmOperationErrMsgs.OperationFailed}. ${err.message}`,
        dbName: dbName || null,
        operation: MongoMethods.Count,
        originalError: err
    });
};
const throwValidationError = (value, message) => {
    throw new MmValidationError({
        code: MmOperationErrCodes.InvalidOptions,
        message: `${MmOperationErrMsgs.InvalidOptions} (${JSON.stringify(value)}). ${message}`,
        operation: MongoMethods.Count,
        value
    });
};
const optionsSchema = new Schema({
    filter: {
        type: Object
    }
});
const validateOptions = (options) => {
    if (options === undefined)
        return true;
    if (validations.isObject(options) === true && Object.keys(options).length === 0)
        return true;
    if (options === null) {
        return throwValidationError(options, '');
    }
    const validationResult = optionsSchema.validate(options);
    if (!validationResult.ok) {
        throwValidationError(options, validationResult.joinErrors());
    }
};
async function count(options = {}) {
    try {
        validateOptions(options);
        const { filter = {} } = options || {};
        const collection = this.getCollectionCtrl();
        const result = await collection.countDocuments(filter);
        return new QueryResult(true, result);
    }
    catch (err) {
        if (err instanceof MmValidationError)
            throw err;
        throwOperationError(err, this.db.dbName);
        return new QueryResult(false, null);
    }
}
export default count;
