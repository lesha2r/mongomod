import { ObjectId } from 'mongodb';
import Schema from 'validno'
import MongoController from '../MongoController.js';
import { MmOperationError } from '../../errors/operationError.js';
import QueryResult from '../../QueryResult.js';
import { MmValidationError } from '../../errors/validationError.js';
import { MmControllerOperations } from '../../constants/controller.js';
import { MmOperationErrors } from '../../constants/operations.js';

export interface MethodFindManyOptions {
    filter: {[key: string]: any}
    limit?: number
    skip?: number
}

interface MethodFindManyParsedOptions {
    filter: {[key: string]: any}
    limit: number
    skip: number
}

const MAX_QUERY_LIMIT = 99999

const validateOptions = (options: MethodFindManyParsedOptions) => {
    const optionsSchema = new Schema({
        filter: { type: Object, required: true },
        limit: { type: Number, required: false },
        skip: { type: Number, required: false }
    })

    const validationResult = optionsSchema.validate(options);
    if (!validationResult.ok) throw new MmValidationError({
        code: MmOperationErrors.InvalidOptions.code,
        message: `${MmOperationErrors.InvalidOptions.message}. ${validationResult.joinErrors()}`,
        dbName: null,
        operation: MmControllerOperations.FindMany
    });
}

const parseOptions = (options: MethodFindManyOptions): MethodFindManyParsedOptions => {
    let filter = options.filter || {};
    let limit = options.limit || MAX_QUERY_LIMIT; // Default to a very high limit
    let skip = options.skip || 0; // Default to no skip

    if (filter._id && typeof filter._id === "string") {
        filter._id = new ObjectId(filter._id); // Convert _id to ObjectId if it exists
    }

    const output = { filter, limit, skip };

    return output;
}

const throwOperationError = (err: any, dbName?: string): MmOperationError => {
    throw new MmOperationError({
        code: MmOperationErrors.OperationFailed.code,
        message: `${MmOperationErrors.OperationFailed.message}. ${err.message}`,
        dbName: dbName || null,
        operation: MmControllerOperations.FindMany,
        originalError: err
    });
}

async function findMany(this: MongoController, options: MethodFindManyOptions) {
    try {
        const { filter, limit, skip } = parseOptions(options);
        validateOptions({ filter, limit, skip });
        
        const collection = this.getCollectionCtrl();
        const result = await collection.find(filter).limit(limit).skip(skip).toArray();

        return new QueryResult(true, result);
    } catch (err: any) {
        if (err instanceof MmValidationError) throw err;
        throwOperationError(err, this.db.dbName);

        // This line is unreachable but included for type consistency
        return new QueryResult(false, null);
    }
};

export default findMany;