import { ObjectId } from 'mongodb';
import Schema from 'validno';
import { MmOperationError } from '../../errors/operationError.js';
import QueryResult from '../../QueryResult.js';
import { MmValidationError } from '../../errors/validationError.js';
import { MmControllerOperations } from '../../constants/controller.js';
import { MmOperationErrors } from '../../constants/operations.js';
const throwOperationError = (err, dbName) => {
    throw new MmOperationError({
        code: MmOperationErrors.OperationFailed.code,
        message: `${MmOperationErrors.OperationFailed.message}. ${err.message}`,
        dbName: dbName || null,
        operation: MmControllerOperations.FindOne,
        originalError: err
    });
};
const validateOptions = (options) => {
    const optionsSchema = new Schema({
        filter: { type: Object, required: true },
    });
    const validationResult = optionsSchema.validate(options);
    if (!validationResult.ok)
        throw new MmValidationError({
            code: MmOperationErrors.InvalidOptions.code,
            message: `${MmOperationErrors.InvalidOptions.message}. ${validationResult.joinErrors()}`,
            dbName: null,
            operation: MmControllerOperations.FindOne
        });
};
const parseOptions = (options) => {
    const filter = options.filter || {};
    if (filter._id && typeof filter._id === "string") {
        filter._id = new ObjectId(filter._id);
    }
    return { filter };
};
async function findOne(options) {
    try {
        const { filter } = parseOptions(options);
        validateOptions(options);
        const collection = this.getCollectionCtrl();
        const result = await collection.findOne(filter);
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
export default findOne;
