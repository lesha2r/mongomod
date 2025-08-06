import MongoModel from '../MongoModel.js';
import { MmModelErrCodes, MmModelErrMsgs } from '../../constants/model.js';
import { MmOperationError, MmValidationError } from '../../errors/index.js';

async function get(this: MongoModel, filter: {[key: string]: any} = {}): Promise<MongoModel> {
    try {
        const found = await this.findOne({ filter });
        
        if (!found.ok) {
            throw new MmOperationError({
                code: MmModelErrCodes.GetFailed,
                message: MmModelErrMsgs.GetFailed,
                dbName: this.db.dbName,
                operation: 'get'
            });
        }

        if (found.data === null || Object.keys(found.data).length === 0) {
            throw new MmOperationError({
                code: MmModelErrCodes.GetFailed,
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
            code: MmModelErrCodes.GetFailed,
            message: `${MmModelErrMsgs.GetFailed}: ${err instanceof Error ? err.message : 'Unknown error'}`,
            dbName: this.db.dbName,
            operation: 'get'
        });
    }
}

export default get;