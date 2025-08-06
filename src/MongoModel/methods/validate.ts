import MongoModel from '../MongoModel.js';
import { MmModelErrCodes, MmModelErrMsgs } from '../../constants/model.js';
import { MmValidationError } from '../../errors/index.js';

function validate(this: MongoModel, data: {[key: string]: any} | null = this.modelData) {
    if (!this.schema) return null;

    const validationResult = this.schema.validate(data);

    if (validationResult.ok === false) {
        throw new MmValidationError({
            code: MmModelErrCodes.InvalidModelData,
            message: `${MmModelErrMsgs.InvalidModelData}: ${validationResult.failed.join(', ')}`,
            dbName: this.db.dbName || null
        });
    }

    return validationResult;
}

export default validate;