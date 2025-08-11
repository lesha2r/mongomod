import QueryResult from "../../QueryResult.js";
import MongoController from "../MongoController.js";
import { MmControllerOperations } from "../../constants/controller.js";
import { MmOperationError } from "../../errors/operationError.js";
import { MmValidationError } from "../../errors/validationError.js";
import { MmOperationErrors } from "../../constants/operations.js";

export interface MethodDeleteOptions {
    filter: {[key: string]: any}
}

const throwOperationError = (err: any, dbName?: string): MmOperationError => {
    throw new MmOperationError({
        code: MmOperationErrors.OperationFailed.code,
        message: `${MmOperationErrors.OperationFailed.message}. ${err.message}`,
        dbName: dbName || null,
        operation: MmControllerOperations.DeleteMany,
        originalError: err
    });
};

const validateFilter = (filter: {[key: string]: any}, dbName?: string): boolean => {
    if (!filter) {
        throw new MmValidationError({
            code: MmOperationErrors.NoFilter.code,
            message: MmOperationErrors.NoFilter.message,
            dbName: dbName || null,
            operation: MmControllerOperations.DeleteMany
        });
    }

    return true;
}

async function deleteMany(this: MongoController, options: MethodDeleteOptions) {
    try {
        const { filter } = options;

        validateFilter(filter, this.db.dbName);

        const collection = this.getCollectionCtrl()
        const result = await collection.deleteMany(filter);
        
        return new QueryResult(true, result);
    } catch (err: any) {
        if (err instanceof MmValidationError) throw err;
        throwOperationError(err, this.db.dbName);

        // This line is unreachable but included for type consistency
        return new QueryResult(false, null);
    }
}

export default deleteMany