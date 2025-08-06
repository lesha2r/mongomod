import Schema from "validno";
import { MongoMethods } from "../../constants/methods.js";
import { MmOperationErrCodes, MmOperationErrMsgs } from "../../constants/operations.js";
import { MmOperationError } from "../../errors/operationError.js";
import { MmValidationError } from "../../errors/validationError.js";
import QueryResult from "../../QueryResult.js";
const throwOperationError = (err, dbName) => {
    throw new MmOperationError({
        code: MmOperationErrCodes.OperationFailed,
        message: `${MmOperationErrMsgs.OperationFailed}. ${err.message}`,
        dbName: dbName || null,
        operation: MongoMethods.UpdateMany,
        originalError: err
    });
};
const parseOptions = (options) => {
    const { filter = {}, update } = options;
    const upsert = (typeof options.params?.upsert !== 'boolean') ? false : options.params.upsert;
    let updateRe = update || {};
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
};
const validateOptions = (options, dbName) => {
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
            code: MmOperationErrCodes.InvalidOptions,
            message: MmOperationErrMsgs.InvalidOptions + '. ' + validationResult.joinErrors(),
            dbName: dbName || null,
            operation: MongoMethods.UpdateMany
        });
    }
    return true;
};
async function updateMany(options) {
    try {
        validateOptions(options, this.db.dbName);
        const { filter, update, params } = parseOptions(options);
        const collection = this.getCollectionCtrl();
        const result = await collection.updateMany(filter, update, params);
        if (!result.acknowledged) {
            throw new MmOperationError({
                code: MmOperationErrCodes.OperationFailed,
                message: MmOperationErrMsgs.OperationFailed,
                dbName: this.db.dbName,
                operation: MongoMethods.UpdateMany
            });
        }
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
export default updateMany;
