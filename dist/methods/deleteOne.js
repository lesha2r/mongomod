import { MongoMethods } from "../constants/methods.js";
import { MmOperationErrCodes, MmOperationErrMsgs } from "../constants/operations.js";
import { MmOperationError } from "../errors/operationError.js";
import { MmValidationError } from "../errors/validationError.js";
import QueryResult from "../QueryResult.js";
const throwOperationError = (err, dbName) => {
    throw new MmOperationError({
        code: MmOperationErrCodes.OperationFailed,
        message: `${MmOperationErrMsgs.OperationFailed}. ${err.message}`,
        dbName: dbName || null,
        operation: MongoMethods.DeleteOne,
        originalError: err
    });
};
const validateFilter = (filter) => {
    if (!filter || typeof filter !== 'object' || Array.isArray(filter)) {
        throw new MmValidationError({
            code: MmOperationErrCodes.NoFilter,
            message: MmOperationErrMsgs.NoFilter,
            dbName: null,
            operation: MongoMethods.DeleteOne
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
