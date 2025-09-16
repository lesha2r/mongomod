import { ObjectId } from 'mongodb';
import Schema from 'validno';
import { MmOperationError } from '../../errors/operationError.js';
import QueryResult from '../../QueryResult.js';
import { MmValidationError } from '../../errors/validationError.js';
import { MmControllerOperations } from '../../constants/controller.js';
import { MmOperationErrors } from '../../constants/operations.js';
const MAX_QUERY_LIMIT = 99999;
const validateOptions = (options) => {
    const optionsSchema = new Schema({
        filter: { type: Object, required: true },
        limit: { type: Number, required: false },
        skip: { type: Number, required: false },
        sort: { type: Object, required: false },
        project: { type: Object, required: false }
    });
    const validationResult = optionsSchema.validate(options);
    if (!validationResult.ok)
        throw new MmValidationError({
            code: MmOperationErrors.InvalidOptions.code,
            message: `${MmOperationErrors.InvalidOptions.message}. ${validationResult.joinErrors()}`,
            dbName: null,
            operation: MmControllerOperations.FindMany
        });
};
const parseOptions = (options) => {
    const filter = options.filter || {};
    const limit = options.limit || MAX_QUERY_LIMIT;
    const skip = options.skip || 0;
    const sort = options.sort || undefined;
    const project = options.project || undefined;
    if (filter._id && typeof filter._id === "string") {
        filter._id = new ObjectId(filter._id);
    }
    return { filter, limit, skip, sort, project };
};
const throwOperationError = (err, dbName) => {
    throw new MmOperationError({
        code: MmOperationErrors.OperationFailed.code,
        message: `${MmOperationErrors.OperationFailed.message}. ${err.message}`,
        dbName: dbName || null,
        operation: MmControllerOperations.FindMany,
        originalError: err
    });
};
async function findMany(options) {
    try {
        const { filter, limit, skip, sort, project } = parseOptions(options);
        validateOptions({ filter, limit, skip, sort, project });
        const collection = this.getCollectionCtrl();
        let query = collection.find(filter);
        if (sort)
            query = query.sort(sort);
        if (skip > 0)
            query = query.skip(skip);
        if (limit > 0)
            query = query.limit(limit);
        if (project)
            query = query.project(project);
        const result = await query.toArray();
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
export default findMany;
