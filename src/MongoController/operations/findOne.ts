import { ObjectId } from 'mongodb';
import Schema from 'validno';
import MongoController from '../MongoController.js';
import { MmOperationError } from '../../errors/operationError.js';
import { MmOperationErrCodes, MmOperationErrMsgs } from '../../constants/operations.js';
import QueryResult from '../../QueryResult.js';
import { MmValidationError } from '../../errors/validationError.js';
import { MmControllerOperations } from '../../constants/controller.js';

export interface MethodFindOneOptions {
    filter: {[key: string]: any}
    limit?: number
    skip?: number
}

const throwOperationError = (err: any, dbName?: string) => {
    throw new MmOperationError({
        code: MmOperationErrCodes.OperationFailed,
        message: `${MmOperationErrMsgs.OperationFailed}. ${err.message}`,
        dbName: dbName || null,
        operation: MmControllerOperations.FindOne,
        originalError: err
    });
}

const validateOptions = (options: MethodFindOneOptions) => {
    const optionsSchema = new Schema({
        filter: { type: Object, required: true },
    });

    const validationResult = optionsSchema.validate(options);

    if (!validationResult.ok) throw new MmValidationError({
        code: MmOperationErrCodes.InvalidOptions,
        message: `${MmOperationErrMsgs.InvalidOptions}. ${validationResult.joinErrors()}`,
        dbName: null,
        operation: MmControllerOperations.FindOne
    });
}

const parseOptions = (options: MethodFindOneOptions): MethodFindOneOptions => {
    const filter = options.filter || {};
    
    if (filter._id && typeof filter._id === "string") {
        filter._id = new ObjectId(filter._id);
    }

    return {filter}
}

// Finds one document matching the filter
async function findOne(this: MongoController, options: MethodFindOneOptions) {
    try {
        const { filter } = parseOptions(options);
        validateOptions(options);

        const collection = this.getCollectionCtrl()
        const result = await collection.findOne(filter);
 
        return new QueryResult(true, result);
    } catch (err: any) {
        if (err instanceof MmValidationError) throw err;
        throwOperationError(err, this.db.dbName);

        // This line is unreachable but included for type consistency
        return new QueryResult(false, null);
    }
};

export default findOne;