import MongoController from '../MongoController.js';
import { MmOperationError } from '../../errors/operationError.js';
import { MmOperationErrCodes, MmOperationErrMsgs } from '../../constants/operations.js';
import QueryResult from '../../QueryResult.js';
import { MmValidationError } from '../../errors/validationError.js';
import { MmControllerOperations } from '../../constants/controller.js';

export interface MethodDistinctOptions {
    field: string
    filter: {[key: string]: any},
}

const validateDistinctOptions = (options: MethodDistinctOptions, dbName?: string): boolean => {
    if (!options || typeof options !== 'object' || !options.field || typeof options.field !== 'string') {
        throw new MmValidationError({
            code: MmOperationErrCodes.NoField,
            message: MmOperationErrMsgs.NoField,
            dbName: dbName || null,
            operation: MmControllerOperations.Distinct
        });
    }

    return true;
}

const throwOperationError = (err: any, dbName?: string): MmOperationError => {
    throw new MmOperationError({
        code: MmOperationErrCodes.OperationFailed,
        message: `${MmOperationErrMsgs.OperationFailed}. ${err.message}`,
        dbName: dbName || null,
        operation: MmControllerOperations.Distinct,
        originalError: err
    });
}

// Counts documents matching the query
async function distinct(this: MongoController, options: MethodDistinctOptions) {
    try {
        validateDistinctOptions(options, this.db.dbName);

        const { field, filter  } = options;
        const collection = this.getCollectionCtrl();
        const result = await collection.distinct(
            field,
            filter || {}
        );

        return new QueryResult(true, result);
    } catch (err: any) {
        if (err instanceof MmValidationError) throw err;
        throwOperationError(err, this.db.dbName);

        // This line is unreachable but included for type consistency
        return new QueryResult(false, null);
    }
}

export default distinct;