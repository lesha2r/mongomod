import { MmOperationError } from '../../errors/operationError.js';
import { MmValidationError } from '../../errors/validationError.js';
import MongoController from '../MongoController.js';
import QueryResult from '../../QueryResult.js';
import Schema, {validations} from 'validno'
import { MmControllerOperations } from '../../constants/controller.js';
import { MmOperationErrors } from '../../constants/operations.js';

export interface MethodCountOptions {
    filter?: {[key: string]: any},
}

const throwOperationError = (err: any, dbName?: string): MmOperationError => {
    throw new MmOperationError({
        code: MmOperationErrors.OperationFailed.code,
        message: `${MmOperationErrors.OperationFailed.message}. ${err.message}`,
        dbName: dbName || null,
        operation: MmControllerOperations.Count,
        originalError: err
    }); 
}

const throwValidationError = (value: any, message: string) => {
    throw new MmValidationError({
        code: MmOperationErrors.InvalidOptions.code,
        message: `${MmOperationErrors.InvalidOptions.message} (${JSON.stringify(value)}). ${message}`,
        operation: MmControllerOperations.Count,
        value
    });
}

const optionsSchema = new Schema({
    filter: {
        type: Object
    }
})

const validateOptions = (options: any) => {
    if (options === undefined) return true;
    if (validations.isObject(options) === true && Object.keys(options).length === 0) return true;

    if (options === null) {
        return throwValidationError(options, '');
    }

    const validationResult = optionsSchema.validate(options);
    if (!validationResult.ok) {
        throwValidationError(options, validationResult.joinErrors());
    }
}

async function count(this: MongoController, options: MethodCountOptions = {}) {
    try {
        validateOptions(options);
        const { filter = {} } = options || {};

        const collection = this.getCollectionCtrl()
        const result = await collection.countDocuments(filter);
        
        return new QueryResult(true, result);
    } catch (err: any) {
        if (err instanceof MmValidationError) throw err;
        throwOperationError(err, this.db.dbName);

        // This line is unreachable but included for type consistency
        return new QueryResult(false, null);
    }
}

export default count;