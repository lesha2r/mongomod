import { ObjectId } from 'mongodb';
import { MongoMethods } from '../constants/methods.js';
import { MmOperationErrCodes, MmOperationErrMsgs } from '../constants/operations.js';
import { MmOperationError } from '../errors/operationError.js';
import { MmValidationError } from '../errors/validationError.js';
import QueryResult from '../QueryResult.js';
const validateData = (data, dbName) => {
    if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).length === 0) {
        throw new MmValidationError({
            code: MmOperationErrCodes.NoData,
            message: MmOperationErrMsgs.NoData,
            dbName: dbName || null,
            operation: MongoMethods.InsertOne
        });
    }
    return true;
};
const throwOperationError = (err, dbName) => {
    if (err.code === 11000) {
        throw new MmOperationError({
            code: MmOperationErrCodes.Duplicate,
            message: `${MmOperationErrMsgs.Duplicate}. ${err.message}`,
            dbName: dbName || null,
            operation: MongoMethods.InsertOne,
            originalError: err
        });
    }
    else if (err.code === 121) {
        throw new MmOperationError({
            code: MmOperationErrCodes.OperationFailed,
            message: `${MmOperationErrMsgs.OperationFailed}. ${err.message}`,
            dbName: dbName || null,
            operation: MongoMethods.InsertOne,
            originalError: err
        });
    }
    throw new MmOperationError({
        code: MmOperationErrCodes.OperationFailed,
        message: `${MmOperationErrMsgs.OperationFailed}. ${err.message}`,
        dbName: dbName || null,
        operation: MongoMethods.InsertOne,
        originalError: err
    });
};
async function insertOne(data) {
    try {
        validateData(data, this.db.dbName);
        const collection = this.getCollectionCtrl();
        const result = await collection.findOneAndUpdate({ _id: new ObjectId() }, { $setOnInsert: data }, { upsert: true, returnDocument: 'after' });
        return new QueryResult(true, result.value);
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
