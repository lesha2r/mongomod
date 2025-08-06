import _ from 'lodash'
import MongoModel from '../MongoModel.js';
import { MmModelErrCodes, MmModelErrMsgs } from '../../constants/model.js';
import { MmOperationError, MmValidationError } from '../../errors/index.js';

async function insert(this: MongoModel): Promise<MongoModel> {
    this.ensureModelData();
    const dataFrozen = this.data(true)

    try {
        const result = await this.insertOne(this.modelData!);

        if (!result.ok) {
            throw new MmOperationError({
                code: MmModelErrCodes.InsertFailed,
                message: MmModelErrMsgs.InsertFailed,
                dbName: this.db.dbName,
                operation: 'insert'
            });
        }

        if (result.data && '_id' in result.data) {
            this.modelData!._id = result.data._id;
            this._subscriber.onCreated(this.modelData, dataFrozen)
        }

        return this;
    } catch (err) {
        // Re-throw our custom errors
        if (err instanceof MmOperationError || err instanceof MmValidationError) {
            throw err;
        }

        // Wrap other errors
        throw new MmOperationError({
            code: MmModelErrCodes.SaveFailed,
            message: `Failed to insert model to database: ${err instanceof Error ? err.message : 'Unknown error'}`,
            dbName: this.db.dbName,
            operation: 'insert'
        });
    }
}

export default insert;