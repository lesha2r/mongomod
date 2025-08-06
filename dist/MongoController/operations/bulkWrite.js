import QueryResult from '../../QueryResult.js';
import { MmOperationError } from '../../errors/operationError.js';
import { MmOperationErrCodes, MmOperationErrMsgs } from '../../constants/operations.js';
import { MmValidationError } from '../../errors/validationError.js';
import { MmControllerOperations } from '../../constants/controller.js';
const validateBulkWriteOptions = (operations, dbName) => {
    if (Array.isArray(operations) !== true || operations.length === 0) {
        throw new MmValidationError({
            code: MmOperationErrCodes.NoData,
            message: MmOperationErrMsgs.NoData,
            dbName: dbName || null,
            operation: MmControllerOperations.BulkWrite
        });
    }
    return true;
};
const throwOperationError = (err, dbName) => {
    throw new MmOperationError({
        code: MmOperationErrCodes.OperationFailed,
        message: `${MmOperationErrMsgs.OperationFailed}. ${err.message}`,
        dbName: dbName || null,
        operation: MmControllerOperations.BulkWrite,
        originalError: err
    });
};
async function bulkWrite(operations) {
    try {
        validateBulkWriteOptions(operations, this.db.dbName);
        const collection = this.getCollectionCtrl();
        const result = await collection.bulkWrite(operations);
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
export default bulkWrite;
