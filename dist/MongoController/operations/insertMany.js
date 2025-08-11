import Schema from 'validno';
import QueryResult from '../../QueryResult.js';
import { MmOperationError } from '../../errors/operationError.js';
import { MmValidationError } from '../../errors/validationError.js';
import { ObjectId } from 'mongodb';
import { MmControllerOperations } from '../../constants/controller.js';
import { MmOperationErrors } from '../../constants/operations.js';
const throwOperationError = (err, dbName) => {
    throw new MmOperationError({
        code: MmOperationErrors.OperationFailed.code,
        message: `${MmOperationErrors.OperationFailed.message}. ${err.message}`,
        dbName: dbName || null,
        operation: MmControllerOperations.InsertMany,
        originalError: err
    });
};
const throwPartiallyFailedError = (err, dbName) => {
    throw new MmOperationError({
        code: MmOperationErrors.OperationPartiallyFailed.code,
        message: MmOperationErrors.OperationPartiallyFailed.message,
        dbName: dbName || null,
        operation: MmControllerOperations.InsertMany
    });
};
const parseOptions = (options) => {
    const parsedOptions = {
        ...options,
    };
    if (typeof parsedOptions.ordered !== 'boolean') {
        parsedOptions.ordered = false;
    }
    return parsedOptions;
};
const validateOptions = (options, dbName) => {
    const optionsSchema = new Schema({
        data: { type: Array, required: true },
        ordered: { type: Boolean, required: false }
    });
    const validationResult = optionsSchema.validate(options);
    if (!validationResult.ok) {
        throw new MmValidationError({
            code: MmOperationErrors.InvalidOptions.code,
            message: MmOperationErrors.InvalidOptions.message + '. ' + validationResult.joinErrors(),
            dbName: dbName || null,
            operation: MmControllerOperations.InsertMany
        });
    }
    return true;
};
async function insertMany(options) {
    try {
        validateOptions(options);
        const { data, ordered } = parseOptions(options);
        const dataClone = JSON.parse(JSON.stringify(data));
        const dataWithIds = dataClone.map((item) => {
            if (!item._id)
                item._id = new ObjectId();
            return item;
        });
        const collection = this.getCollectionCtrl();
        const result = await collection.insertMany(dataWithIds, { ordered });
        if (result.acknowledged === false || result.insertedCount !== dataWithIds.length) {
            throwPartiallyFailedError(this.db.dbName);
        }
        return new QueryResult(true, dataWithIds);
    }
    catch (err) {
        if (err instanceof MmValidationError)
            throw err;
        throwOperationError(err, this.db.dbName);
        return new QueryResult(false, null);
    }
}
;
export default insertMany;
