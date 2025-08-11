import MongoModel from '../MongoModel.js';
import { MmOperationError } from '../../errors/index.js';
import { MmModelErrors } from '../../constants/model.js';

async function deleteMethod(this: MongoModel): Promise<MongoModel> {
    this.ensureModelId();
    const dataFrozen = this.data(true)

    try {
        const filter = { _id: this.modelData!._id };
        const result = await this.deleteOne({ filter });

        // Check if deletion was successful
        if (!result.ok) {
            throw new MmOperationError({
                code: MmModelErrors.DeleteFailed.code,
                message: MmModelErrors.DeleteFailed.message,
                dbName: this.db.dbName,
                operation: 'delete'
            });
        }

        // Clear model data after successful deletion
        this.modelData = null;

        this._subscriber.onDeleted(this.modelData, dataFrozen)

        return this;
    } catch (err) {
        // Re-throw custom errors
        if (err instanceof MmOperationError) throw err;

        // Wrap other errors
        throw new MmOperationError({
            code: MmModelErrors.DeleteFailed.code,
            message: `${MmModelErrors.DeleteFailed.message}: ${err instanceof Error ? err.message : 'Unknown error'}`,
            dbName: this.db.dbName,
            operation: 'delete'
        });
    }
}

export default deleteMethod;