import { MmOperationError } from '../../errors/operationError.js';
import QueryResult from '../../QueryResult.js';
import { MmValidationError } from '../../errors/validationError.js';
import { MmControllerOperations } from '../../constants/controller.js';
import { MmOperationErrors } from '../../constants/operations.js';
const validateDistinctOptions = (options, dbName) => {
    if (!options || typeof options !== 'object' || !options.field || typeof options.field !== 'string') {
        throw new MmValidationError({
            code: MmOperationErrors.NoField.code,
            message: MmOperationErrors.NoField.message,
            dbName: dbName || null,
            operation: MmControllerOperations.Distinct
        });
    }
    return true;
};
const throwOperationError = (err, dbName) => {
    throw new MmOperationError({
        code: MmOperationErrors.OperationFailed.code,
        message: `${MmOperationErrors.OperationFailed.message}. ${err.message}`,
        dbName: dbName || null,
        operation: MmControllerOperations.Distinct,
        originalError: err
    });
};
async function distinct(options) {
    try {
        validateDistinctOptions(options, this.db.dbName);
        const { field, filter } = options;
        const collection = this.getCollectionCtrl();
        const result = await collection.distinct(field, filter || {});
        return new QueryResult(true, result);
    }
    catch (err) {
        if (err instanceof MmValidationError)
            throw err;
        throwOperationError(err, this.db.dbName);
        return new QueryResult(false, null);
    }
}
export default distinct;
