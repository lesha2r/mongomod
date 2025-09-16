import MongoModel from '../MongoModel.js';
import { MmValidationError } from '../../errors/index.js';
import { MmModelErrors } from '../../constants/model.js';

function validate(this: MongoModel, data: {[key: string]: any} | null = this.modelData) {
    if (!this.schema) return null;

    const validationResult = this.schema.validate(data, []);

    if (validationResult.ok === false) {
        throw new MmValidationError({
            code: MmModelErrors.InvalidModelData.code,
            message: `${MmModelErrors.InvalidModelData.message}: ${validationResult.failed.join(', ')}`,
            dbName: this.db.dbName || null
        });
    }

    return validationResult;
}

export default validate;