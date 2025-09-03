import { ObjectId } from 'mongodb';
import { MmOperationError } from '../../errors/operationError.js';
import { MmValidationError } from '../../errors/validationError.js';
import QueryResult from '../../QueryResult.js';
import { MmControllerOperations } from '../../constants/controller.js';
import { MmOperationErrors } from '../../constants/operations.js';
const validateData = (data, dbName) => {
    if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).length === 0) {
        throw new MmValidationError({
            code: MmOperationErrors.NoData.code,
            message: MmOperationErrors.NoData.message,
            dbName: dbName || null,
            operation: MmControllerOperations.InsertOne
        });
    }
    return true;
};
const throwOperationError = (err, dbName) => {
    if (err.code === 11000) {
        throw new MmOperationError({
            code: MmOperationErrors.Duplicate.code,
            message: `${MmOperationErrors.Duplicate.message}. ${err.message}`,
            dbName: dbName || null,
            operation: MmControllerOperations.InsertOne,
            originalError: err
        });
    }
    else if (err.code === 121) {
        throw new MmOperationError({
            code: MmOperationErrors.OperationFailed.code,
            message: `${MmOperationErrors.OperationFailed.message}. ${err.message}`,
            dbName: dbName || null,
            operation: MmControllerOperations.InsertOne,
            originalError: err
        });
    }
    throw new MmOperationError({
        code: MmOperationErrors.OperationFailed.code,
        message: `${MmOperationErrors.OperationFailed.message}. ${err.message}`,
        dbName: dbName || null,
        operation: MmControllerOperations.InsertOne,
        originalError: err
    });
};
async function insertOne(data) {
    try {
        validateData(data, this.db.dbName);
        const collection = this.getCollectionCtrl();
        const result = await collection.findOneAndUpdate({ _id: new ObjectId() }, { $setOnInsert: data }, { upsert: true, returnDocument: 'after' });
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
export default insertOne;
