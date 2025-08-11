import QueryResult from '../../QueryResult.js';
import MongoController from '../MongoController.js';
import { MmOperationError } from '../../errors/operationError.js';
import { MmValidationError } from '../../errors/validationError.js';
import { MmControllerOperations } from '../../constants/controller.js';
import { MmOperationErrors } from '../../constants/operations.js';

export type MethodBulkWriteOptions = any[]

const validateBulkWriteOptions = (operations: MethodBulkWriteOptions, dbName?: string): boolean => {
    if (Array.isArray(operations) !== true || operations.length === 0) {
            throw new MmValidationError({
                code: MmOperationErrors.NoData.code,
                message: MmOperationErrors.NoData.message,
                dbName: dbName || null,
                operation: MmControllerOperations.BulkWrite
            })
        }

    return true;
}

const throwOperationError = (err: any, dbName?: string): MmOperationError => {
    throw new MmOperationError({
        code: MmOperationErrors.OperationFailed.code,
        message: `${MmOperationErrors.OperationFailed.message}. ${err.message}`,
        dbName: dbName || null,
        operation: MmControllerOperations.BulkWrite,
        originalError: err
    });
}

async function bulkWrite(this: MongoController, operations: MethodBulkWriteOptions) {
    try {
        validateBulkWriteOptions(operations, this.db.dbName);

        const collection = this.getCollectionCtrl()
        const result = await collection.bulkWrite(operations);
        
        return new QueryResult(true, result);
    } catch (err: any) {
        if (err instanceof MmValidationError) throw err;
        throwOperationError(err, this.db.dbName);

        // This line is unreachable but included for type consistency
        return new QueryResult(false, null);
    }
};

export default bulkWrite