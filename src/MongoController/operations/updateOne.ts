import { ObjectId, ReturnDocument } from 'mongodb';
import MongoController from '../MongoController.js';
import { MmOperationError } from '../../errors/operationError.js';
import QueryResult from '../../QueryResult.js';
import { MmValidationError } from '../../errors/validationError.js';
import Schema from 'validno';
import { MmControllerOperations } from '../../constants/controller.js';
import { MmOperationErrors } from '../../constants/operations.js';

export type MethodUpdateOneOptions = {
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
        operation: MmControllerOperations.UpdateOne,
        originalError: err
    });
}

const optionsSchema = new Schema({
    filter: { type: Object },
    update: { type: Object },
    params: {
        upsert: { type: Boolean, required: false },
    }
})

const validateOptions = (options: MethodUpdateOneOptions, dbName?: string): boolean => {
    const validationResult = optionsSchema.validate(options);
    
    if (!validationResult.ok) {
        throw new MmValidationError({
            code: MmOperationErrors.InvalidOptions.code,
            message: `${MmOperationErrors.InvalidOptions.message}. ${validationResult.joinErrors()}`,
            dbName: dbName || null,
            operation: MmControllerOperations.UpdateOne
        });
    }

    if (!options.update || Object.keys(options.update).length === 0) {
        throw new MmValidationError({
            code: MmOperationErrors.NoData.code,
            message: `${MmOperationErrors.NoData.message}. Data to update cannot be empty.`,
            dbName: dbName || null,
            operation: MmControllerOperations.UpdateOne
        });
    }

    return true;
}

const parseOptions = (options: MethodUpdateOneOptions) => {
    const filter = options.filter || {};
    let updateRe = options.update || {};
    const params = {
        upsert: (!options.params || typeof options.params?.upsert !== 'boolean') ? false : options.params.upsert,
        returnDocument: ReturnDocument.AFTER // default to returning the updated document
    }

    // convert _id to ObjectId if it's a string
    if (filter._id) filter._id = new ObjectId(filter._id);
    
    // checks that update has atomic operators and add $set if not
    if (Object.keys(updateRe).length > 0 && Object.keys(updateRe).every(key => !key.startsWith('$'))) {
        updateRe = { $set: updateRe };
    }

    return {
        filter,
        update: updateRe,
        params
    };
};

// Updates one document matching the filter
async function updateOne(this: MongoController, options: MethodUpdateOneOptions) {
    try {
        validateOptions(options, this.db.dbName);
        const { filter, update, params } = parseOptions(options);

        const collection = this.getCollectionCtrl();
        const result = await collection.findOneAndUpdate(
            filter, update, params
        );

        return new QueryResult(true, result)
    } catch (err: any) {
        if (err instanceof MmValidationError) throw err;
        throwOperationError(err, this.db.dbName);

        // This line is unreachable but included for type consistency
        return new QueryResult(false, null);
    }
};

export default updateOne;