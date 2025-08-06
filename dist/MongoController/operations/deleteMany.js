import QueryResult from "../../QueryResult.js";
import { MmControllerOperations } from "../../constants/controller.js";
import { MmOperationError } from "../../errors/operationError.js";
import { MmOperationErrCodes, MmOperationErrMsgs } from "../../constants/operations.js";
import { MmValidationError } from "../../errors/validationError.js";
const throwOperationError = (err, dbName) => {
    throw new MmOperationError({
        code: MmOperationErrCodes.OperationFailed,
        message: `${MmOperationErrMsgs.OperationFailed}. ${err.message}`,
        dbName: dbName || null,
        operation: MmControllerOperations.DeleteMany,
        originalError: err
    });
};
const validateFilter = (filter, dbName) => {
    if (!filter) {
        throw new MmValidationError({
            code: MmOperationErrCodes.NoFilter,
            message: MmOperationErrMsgs.NoFilter,
            dbName: dbName || null,
            operation: MmControllerOperations.DeleteMany
        });
    }
    return true;
};
async function deleteMany(options) {
    try {
        const { filter } = options;
        validateFilter(filter, this.db.dbName);
        const collection = this.getCollectionCtrl();
        const result = await collection.deleteMany(filter);
        return new QueryResult(true, result);
    }
    catch (err) {
        if (err instanceof MmValidationError)
            throw err;
        throwOperationError(err, this.db.dbName);
        return new QueryResult(false, null);
    }
}
export default deleteMany;
