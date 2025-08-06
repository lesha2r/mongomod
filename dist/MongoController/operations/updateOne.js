import { ObjectId, ReturnDocument } from 'mongodb';
import { MmOperationError } from '../../errors/operationError.js';
import { MmOperationErrCodes, MmOperationErrMsgs } from '../../constants/operations.js';
import QueryResult from '../../QueryResult.js';
import { MmValidationError } from '../../errors/validationError.js';
import Schema from 'validno';
import { MmControllerOperations } from '../../constants/controller.js';
const throwOperationError = (err, dbName) => {
    throw new MmOperationError({
        code: MmOperationErrCodes.OperationFailed,
        message: `${MmOperationErrMsgs.OperationFailed}. ${err.message}`,
        dbName: dbName || null,
        operation: MmControllerOperations.UpdateOne,
        originalError: err
    });
};
const optionsSchema = new Schema({
    filter: { type: Object },
    update: { type: Object },
    params: {
        upsert: { type: Boolean, required: false },
    }
});
const validateOptions = (options, dbName) => {
    const validationResult = optionsSchema.validate(options);
    if (!validationResult.ok) {
        throw new MmValidationError({
            code: MmOperationErrCodes.InvalidOptions,
            message: `${MmOperationErrMsgs.InvalidOptions}. ${validationResult.joinErrors()}`,
            dbName: dbName || null,
            operation: MmControllerOperations.UpdateOne
        });
    }
    if (!options.update || Object.keys(options.update).length === 0) {
        throw new MmValidationError({
            code: MmOperationErrCodes.NoData,
            message: `${MmOperationErrMsgs.NoData}. Data to update cannot be empty.`,
            dbName: dbName || null,
            operation: MmControllerOperations.UpdateOne
        });
    }
    return true;
};
const parseOptions = (options) => {
    const filter = options.filter || {};
    let updateRe = options.update || {};
    const params = {
        upsert: (!options.params || typeof options.params?.upsert !== 'boolean') ? false : options.params.upsert,
        returnDocument: ReturnDocument.AFTER
    };
    if (filter._id)
        filter._id = new ObjectId(filter._id);
    if (Object.keys(updateRe).length > 0 && Object.keys(updateRe).every(key => !key.startsWith('$'))) {
        updateRe = { $set: updateRe };
    }
    return {
        filter,
        update: updateRe,
        params
    };
};
async function updateOne(options) {
    try {
        validateOptions(options, this.db.dbName);
        const { filter, update, params } = parseOptions(options);
        const collection = this.getCollectionCtrl();
        const result = await collection.findOneAndUpdate(filter, update, params);
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
export default updateOne;
