import { ObjectId } from 'mongodb';
import { MmOperationErrCodes, MmOperationErrMsgs } from '../../constants/operations.js';
import { MmOperationError } from '../../errors/operationError.js';
import { MmValidationError } from '../../errors/validationError.js';
import MongoController from '../MongoController.js';
import QueryResult from '../../QueryResult.js';
import { MmControllerOperations } from '../../constants/controller.js';

export interface MethodInsertOneOptions {[key: string]: any}

const validateData = (data: {[key: string]: any}, dbName?: string): boolean => {
    if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).length === 0) {
        throw new MmValidationError({
            code: MmOperationErrCodes.NoData,
            message: MmOperationErrMsgs.NoData,
            dbName: dbName || null,
            operation: MmControllerOperations.InsertOne
        });
    }

    return true;
}

const throwOperationError = (err: any, dbName?: string): MmOperationError => {
    if (err.code === 11000) {
        throw new MmOperationError({
            code: MmOperationErrCodes.Duplicate,
            message: `${MmOperationErrMsgs.Duplicate}. ${err.message}`,
            dbName: dbName || null,
            operation: MmControllerOperations.InsertOne,
            originalError: err
        });
    } else if (err.code === 121) {
        throw new MmOperationError({
            code: MmOperationErrCodes.OperationFailed,
            message: `${MmOperationErrMsgs.OperationFailed}. ${err.message}`,
            dbName: dbName || null,
            operation: MmControllerOperations.InsertOne,
            originalError: err
        });
    }
    
    throw new MmOperationError({
        code: MmOperationErrCodes.OperationFailed,
        message: `${MmOperationErrMsgs.OperationFailed}. ${err.message}`,
        dbName: dbName || null,
        operation: MmControllerOperations.InsertOne,
        originalError: err
    });
}

async function insertOne(this: MongoController, data: MethodInsertOneOptions) {
    try {
        validateData(data, this.db.dbName);
        
        const collection = this.getCollectionCtrl();
        const result = await collection.findOneAndUpdate(
            {_id: new ObjectId()},   
            {$setOnInsert: data},
            {upsert: true, returnDocument: 'after'}
        );
        
        return new QueryResult(true, result.value);
    } catch (err: any) {
        if (err instanceof MmValidationError) throw err;
        throwOperationError(err, this.db.dbName);

        // This line is unreachable but included for type consistency
        return new QueryResult(false, null);
    }
};

export default insertOne;