import _ from 'lodash'
import MongoModel from '../MongoModel.js';
import { MmOperationError, MmValidationError } from '../../errors/index.js';
import { MmModelErrors } from '../../constants/model.js';

const getUnsetPayload = (dataFrozen: Record<string, any>): Record<string, ''> => {
    const $unset: Record<string, ''> = {}

    for (const key in dataFrozen) {
        if (dataFrozen[key] === undefined) {
            // @ts-ignore
            $unset[key] = true;
            delete dataFrozen[key];
        }
    }

    return $unset
}

const getSetPayload = (dataFrozen: Record<string, any>): Record<string, any> => {
    const $set: Record<string, any> = {}

    for (const [key, value] of Object.entries(dataFrozen)) {
        if (key === '_id' || value === undefined) {
            continue;
        }

        $set[key] = value;
    }

    return $set;
}

async function save(this: MongoModel): Promise<MongoModel> {
    this.ensureModelData();

    try {
        if (!this.modelData || !this.modelData._id) {
            return this.insert();
        } else {
            this.ensureModelId();
            this.validate(this.modelData);

            const dataFrozen = _.clone(this.modelData);
            const $set = getSetPayload(dataFrozen);
            const $unset = getUnsetPayload(dataFrozen);
            const updatePayload: Record<string, any> = {
                $set
            };

            if (Object.keys($unset).length > 0) {
                updatePayload.$unset = $unset;
            }

            const result = await this.updateOne({
                filter: { _id: this.modelData._id },
                update: updatePayload
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
        
        this._subscriber.onUpdated(this.modelData, this._modelDataBeforeSave)
        this._modelDataBeforeSave = _.clone(this.modelData)

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