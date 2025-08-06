import _ from 'lodash'
import MongoModel from '../MongoModel.js';
import { MmModelErrCodes, MmModelErrMsgs } from '../../constants/model.js';
import { MmOperationError, MmValidationError } from '../../errors/index.js';

async function save(this: MongoModel, insertIfNotExists: boolean = false): Promise<MongoModel> {
    this.ensureModelData();
    const dataFrozen = _.clone(this._modelDataBeforeSave)

    try {
        if (insertIfNotExists === true) {
            return this.insert();
        } else {
            this.ensureModelId();

            const result = await this.updateOne({
                filter: { _id: this.modelData!._id },
                update: this.modelData!
            });

            if (!result.ok) {
                throw new MmOperationError({
                    code: MmModelErrCodes.SaveFailed,
                    message: MmModelErrMsgs.SaveFailed,
                    dbName: this.db.dbName,
                    operation: 'save'
                });
            }
        }

        this._modelDataBeforeSave = this.data(true)
        this._subscriber.onUpdated(this.modelData, dataFrozen)

        return this;
    } catch (err) {
        // Re-throw our custom errors
        if (err instanceof MmOperationError || err instanceof MmValidationError) {
            throw err;
        }

        // Wrap other errors
        throw new MmOperationError({
            code: MmModelErrCodes.SaveFailed,
            message: `${MmModelErrMsgs.SaveFailed}: ${err instanceof Error ? err.message : 'Unknown error'}`,
            dbName: this.db.dbName,
            operation: 'save'
        });
    }
}

export default save;