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
    sort?: {[key: string]: 1 | -1}
    project?: {[key: string]: 0 | 1}
}

interface MethodFindManyParsedOptions {
    filter: {[key: string]: any}
    limit: number
    skip: number
    sort?: {[key: string]: 1 | -1}
    project?: {[key: string]: 0 | 1}
}

const MAX_QUERY_LIMIT = 99999

const validateOptions = (options: MethodFindManyParsedOptions) => {
    const optionsSchema = new Schema({
        filter: { type: Object, required: true },
        limit: { type: Number, required: false },
        skip: { type: Number, required: false },
        sort: { type: Object, required: false },
        project: { type: Object, required: false }
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
    const filter = options.filter || {};
    const limit = options.limit || MAX_QUERY_LIMIT; // Default to a very high limit
    const skip = options.skip || 0; // Default to no skip
    const sort = options.sort || undefined;
    const project = options.project || undefined;

    if (filter._id && typeof filter._id === "string") {
        filter._id = new ObjectId(filter._id); // Convert _id to ObjectId if it exists
    }

    return { filter, limit, skip, sort, project };
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
        const { filter, limit, skip, sort, project } = parseOptions(options);
        validateOptions({ filter, limit, skip, sort, project });
        
        const collection = this.getCollectionCtrl();
        let query = collection.find(filter);
        
        // Conditionally apply methods only if values exist
        if (sort) query = query.sort(sort);
        if (skip > 0) query = query.skip(skip);
        if (limit > 0) query = query.limit(limit);
        if (project) query = query.project(project);
        
        const result = await query.toArray();

        return new QueryResult(true, result);
    } catch (err: any) {
        if (err instanceof MmValidationError) throw err;
        throwOperationError(err, this.db.dbName);

        // This line is unreachable but included for type consistency
        return new QueryResult(false, null);
    }
};

export default findMany;