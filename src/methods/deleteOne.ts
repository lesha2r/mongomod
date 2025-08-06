import { MongoMethods } from "../constants/methods.js";
import { MmOperationErrCodes, MmOperationErrMsgs } from "../constants/operations.js";
import { MmOperationError } from "../errors/operationError.js";
import { MmValidationError } from "../errors/validationError.js";
import MongoController from "../MongoController.js";
import QueryResult from "../QueryResult.js";

export interface MethodDeleteOneOptions {
    filter: {[key: string]: any}
}

const throwOperationError = (err: any, dbName?: string): boolean => {
    throw new MmOperationError({
        code: MmOperationErrCodes.OperationFailed,
        message: `${MmOperationErrMsgs.OperationFailed}. ${err.message}`,
        dbName: dbName || null,
        operation: MongoMethods.DeleteOne,
        originalError: err
    });
}

const validateFilter = (filter: {[key: string]: any}) => {
    if (!filter || typeof filter !== 'object' || Array.isArray(filter)) {
        throw new MmValidationError({
            code: MmOperationErrCodes.NoFilter,
            message: MmOperationErrMsgs.NoFilter,
            dbName: null,
            operation: MongoMethods.DeleteOne
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