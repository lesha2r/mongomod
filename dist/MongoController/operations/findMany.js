import { ObjectId } from 'mongodb';
import Schema from 'validno';
import { MmOperationError } from '../../errors/operationError.js';
import QueryResult from '../../QueryResult.js';
import { MmValidationError } from '../../errors/validationError.js';
import { MmControllerOperations } from '../../constants/controller.js';
import { MmOperationErrors } from '../../constants/operations.js';
const MAX_QUERY_LIMIT = 99999;
const validateOptions = (options) => {
    const optionsSchema = new Schema({
        filter: { type: Object, required: true },
        limit: { type: Number, required: false },
        skip: { type: Number, required: false }
    });
    const validationResult = optionsSchema.validate(options);
    if (!validationResult.ok)
        throw new MmValidationError({
            code: MmOperationErrors.InvalidOptions.code,
            message: `${MmOperationErrors.InvalidOptions.message}. ${validationResult.joinErrors()}`,
            dbName: null,
            operation: MmControllerOperations.FindMany
        });
};
const parseOptions = (options) => {
    let filter = options.filter || {};
    let limit = options.limit || MAX_QUERY_LIMIT;
    let skip = options.skip || 0;
    if (filter._id && typeof filter._id === "string") {
        filter._id = new ObjectId(filter._id);
    }
    const output = { filter, limit, skip };
    return output;
};
const throwOperationError = (err, dbName) => {
    throw new MmOperationError({
        code: MmOperationErrors.OperationFailed.code,
        message: `${MmOperationErrors.OperationFailed.message}. ${err.message}`,
        dbName: dbName || null,
        operation: MmControllerOperations.FindMany,
        originalError: err
    });
};
async function findMany(options) {
    try {
        const { filter, limit, skip } = parseOptions(options);
        validateOptions({ filter, limit, skip });
        const collection = this.getCollectionCtrl();
        const result = await collection.find(filter).limit(limit).skip(skip).toArray();
        return new QueryResult(true, result);
    }
    catch (err) {
        if (err instanceof MmValidationError)
            throw err;
        throwOperationError(err, this.db.dbName);
        return new QueryResult(false, null);
    }
}
;
export default findMany;
