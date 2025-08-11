import MongoModel from '../MongoModel.js';
import { MmOperationError, MmValidationError } from '../../errors/index.js';
import { MmModelErrors } from '../../constants/model.js';

async function get(this: MongoModel, filter: {[key: string]: any} = {}): Promise<MongoModel> {
    try {
        const found = await this.findOne({ filter });
        
        if (!found.ok) {
            throw new MmOperationError({
                code: MmModelErrors.GetFailed.code,
                message: MmModelErrors.GetFailed.message,
                dbName: this.db.dbName,
                operation: 'get'
            });
        }

        if (found.data === null || Object.keys(found.data).length === 0) {
            throw new MmOperationError({
                code: MmModelErrors.GetFailed.code,
                message: 'No document found matching the provided filter',
                dbName: this.db.dbName,
                operation: 'get'
            });
        }
        
        this.modelData = found.data;
        this.validate(this.modelData);

        return this;
    } catch (err) {
        // Re-throw our custom errors
        if (err instanceof MmOperationError || err instanceof MmValidationError) {
            throw err;
        }

        // Wrap other errors
        throw new MmOperationError({
            code: MmModelErrors.GetFailed.code,
            message: `${MmModelErrors.GetFailed.message}: ${err instanceof Error ? err.message : 'Unknown error'}`,
            dbName: this.db.dbName,
            operation: 'get'
        });
    }
}

export default get;