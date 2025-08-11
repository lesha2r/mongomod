import { MmControllerOperations } from "../../constants/controller.js";
import { MmOperationError } from "../../errors/operationError.js";
import { MmValidationError } from "../../errors/validationError.js";
import MongoController from "../MongoController.js";
import QueryResult from "../../QueryResult.js";
import { MmOperationErrors } from "../../constants/operations.js";

export interface MethodDeleteOneOptions {
    filter: {[key: string]: any}
}

const throwOperationError = (err: any, dbName?: string): boolean => {
    throw new MmOperationError({
        code: MmOperationErrors.OperationFailed.code,
        message: `${MmOperationErrors.OperationFailed.message}. ${err.message}`,
        dbName: dbName || null,
        operation: MmControllerOperations.DeleteOne,
        originalError: err
    });
}

const validateFilter = (filter: {[key: string]: any}) => {
    if (!filter || typeof filter !== 'object' || Array.isArray(filter)) {
        throw new MmValidationError({
            code: MmOperationErrors.NoFilter.code,
            message: MmOperationErrors.NoFilter.message,
            dbName: null,
            operation: MmControllerOperations.DeleteOne
        });
    }

    return true;
}

async function deleteOne(this: MongoController, options: MethodDeleteOneOptions) {
    try {
        const { filter } = options;

        validateFilter(filter)

        const collection = this.getCollectionCtrl()
        const result = await collection.findOneAndDelete(filter);
        
        return new QueryResult(true, result);
    } catch (err: any) {
        if (err instanceof MmValidationError) throw err;
        throwOperationError(err, this.db.dbName);

        // This line is unreachable but included for type consistency
        return new QueryResult(false, null);
    }
};

export default deleteOne;