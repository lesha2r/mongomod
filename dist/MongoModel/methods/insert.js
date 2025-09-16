import { MmOperationError, MmValidationError } from '../../errors/index.js';
import { MmModelErrors } from '../../constants/model.js';
async function insert() {
    this.ensureModelData();
    const dataFrozen = this.data(true);
    try {
        const result = await this.insertOne(this.modelData);
        if (!result.ok) {
            throw new MmOperationError({
                code: MmModelErrors.InsertFailed.code,
                message: MmModelErrors.InsertFailed.message,
                dbName: this.db.dbName,
                operation: 'insert'
            });
        }
        if (result.data && '_id' in result.data) {
            this.modelData._id = result.data._id;
            this._subscriber.onCreated(this.modelData, null);
        }
        return this;
    }
    catch (err) {
        if (err instanceof MmOperationError || err instanceof MmValidationError) {
            throw err;
        }
        throw new MmOperationError({
            code: MmModelErrors.InsertFailed.code,
            message: `Failed to insert model to database: ${err instanceof Error ? err.message : 'Unknown error'}`,
            dbName: this.db.dbName,
            operation: 'insert'
        });
    }
}
export default insert;
