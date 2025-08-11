import Schema from "validno";
import { MmOperationError } from "../../errors/operationError.js"
import { MmValidationError } from "../../errors/validationError.js"
import MongoController from "../MongoController.js"
import QueryResult from "../../QueryResult.js"
import { MmControllerOperations } from "../../constants/controller.js";
import { MmOperationErrors } from "../../constants/operations.js";

export interface MethodUpdateManyOptions {
    filter: {[key: string]: any}
    update: {[key: string]: any}
    params?: {
        upsert?: boolean
    }
}

const throwOperationError = (err: any, dbName?: string): MmOperationError => {
    throw new MmOperationError({
        code: MmOperationErrors.OperationFailed.code,
        message: `${MmOperationErrors.OperationFailed.message}. ${err.message}`,
        dbName: dbName || null,
        operation: MmControllerOperations.UpdateMany,
        originalError: err
    });
}

const parseOptions = (options: MethodUpdateManyOptions): UpdateManyOptions => {
    const { filter = {}, update } = options;

    const upsert = (typeof options.params?.upsert !== 'boolean') ? false : options.params.upsert;
    let updateRe: UpdateManyUpdate = update || {};

    // checks that update has atomic operators and add $set if not
    if (Object.keys(updateRe).length > 0 && Object.keys(updateRe).every(key => !key.startsWith('$'))) {
        updateRe = { $set: updateRe };
    }

    return {
        filter,
        update: updateRe,
        params: {
            upsert
        },
    };
}

interface UpdateManyFilter {
    [key: string]: any
}

interface UpdateManyUpdate {
    $set?: {[key: string]: any}
    $unset?: {[key: string]: any}
    [key: string]: any
}

interface UpdateManyParams {
    upsert: boolean
    unset?: boolean
    [key: string]: any
}

interface UpdateManyOptions {
    filter: UpdateManyFilter
    update: UpdateManyUpdate
    params: UpdateManyParams
}

const validateOptions = (options: MethodUpdateManyOptions, dbName?: string): boolean => {
    const optionsSchema = new Schema({
        filter: { type: Object, required: false },
        update: { type: Object, required: true },
        params: {
            upsert: { type: Boolean, required: false }
        }
    });

    const validationResult = optionsSchema.validate(options);

    if (!validationResult.ok) {
        throw new MmValidationError({
            code: MmOperationErrors.InvalidOptions.code,
            message: MmOperationErrors.InvalidOptions.message + '. ' + validationResult.joinErrors(),
            dbName: dbName || null,
            operation: MmControllerOperations.UpdateMany
        });
    }

    return true;
}

async function updateMany(this: MongoController, options: MethodUpdateManyOptions)  {
    try {
        validateOptions(options, this.db.dbName);
        const { filter, update, params } = parseOptions(options);
        
        const collection = this.getCollectionCtrl();
        const result = await collection.updateMany(filter, update, params);
        
        if (!result.acknowledged) {
            throw new MmOperationError({
                code: MmOperationErrors.OperationFailed.code,
                message: MmOperationErrors.OperationFailed.message,
                dbName: this.db.dbName,
                operation: MmControllerOperations.UpdateMany
            });
        }

        return new QueryResult(true, result);
    } catch (err: any) {
        if (err instanceof MmValidationError) throw err;
        throwOperationError(err, this.db.dbName);

        // This line is unreachable but included for type consistency
        return new QueryResult(false, null);
    }
};

export default updateMany;