import _ from 'lodash'
import MongoModel from '../MongoModel.js';
import { MmOperationError, MmValidationError } from '../../errors/index.js';
import { MmModelErrors } from '../../constants/model.js';

const getUnsetPayload = (dataFrozen: Record<string, any>): Record<string, ''> => {
    const $unset: Record<string, any> = {}

    for (const key in dataFrozen) {
        if (dataFrozen[key] === undefined) {
            $unset[key] = true;
            delete dataFrozen[key];
        }
    }

    return $unset
}

async function save(this: MongoModel): Promise<MongoModel> {
    this.ensureModelData();
    const dataBeforeSave = _.clone(this._modelDataBeforeSave)

    try {
        if (!this.modelData || !this.modelData._id) {
            return this.insert();
        } else {
            this.ensureModelId();

            const dataFrozen = this.modelData;
            dataFrozen!._id = this.modelData!._id;

            const result = await this.updateOne({
                filter: { _id: dataFrozen!._id },
                update: {
                    $set: dataFrozen,
                    $unset: getUnsetPayload(dataFrozen)
                }
            });

            if (!result.ok) {
                throw new MmOperationError({
                    code: MmModelErrors.SaveFailed.code,
                    message: MmModelErrors.SaveFailed.message,
                    dbName: this.db.dbName,
                    operation: 'save'
                });
            }


        }

        this._modelDataBeforeSave = this.data(true)
        this._subscriber.onUpdated(this.modelData, dataBeforeSave)

        return this;
    } catch (err) {
        // Re-throw our custom errors
        if (err instanceof MmOperationError || err instanceof MmValidationError) {
            throw err;
        }

        // Wrap other errors
        throw new MmOperationError({
            code: MmModelErrors.SaveFailed.code,
            message: `${MmModelErrors.SaveFailed.message}: ${err instanceof Error ? err.message : 'Unknown error'}`,
            dbName: this.db.dbName,
            operation: 'save'
        });
    }
}

export default save;