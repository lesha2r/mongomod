import { MmControllerOperations } from "../../constants/controller.js";
import { MmOperationError } from "../../errors/operationError.js";
import { MmValidationError } from "../../errors/validationError.js";
import QueryResult from "../../QueryResult.js";
import { MmOperationErrors } from "../../constants/operations.js";
const throwOperationError = (err, dbName) => {
    throw new MmOperationError({
        code: MmOperationErrors.OperationFailed.code,
        message: `${MmOperationErrors.OperationFailed.message}. ${err.message}`,
        dbName: dbName || null,
        operation: MmControllerOperations.DeleteOne,
        originalError: err
    });
};
const validateFilter = (filter) => {
    if (!filter || typeof filter !== 'object' || Array.isArray(filter)) {
        throw new MmValidationError({
            code: MmOperationErrors.NoFilter.code,
            message: MmOperationErrors.NoFilter.message,
            dbName: null,
            operation: MmControllerOperations.DeleteOne
        });
    }
    return true;
};
async function deleteOne(options) {
    try {
        const { filter } = options;
        validateFilter(filter);
        const collection = this.getCollectionCtrl();
        const result = await collection.findOneAndDelete(filter);
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
export default deleteOne;
