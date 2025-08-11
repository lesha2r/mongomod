import { MmOperationError } from '../../errors/index.js';
import { MmModelErrors } from '../../constants/model.js';
async function deleteMethod() {
    this.ensureModelId();
    const dataFrozen = this.data(true);
    try {
        const filter = { _id: this.modelData._id };
        const result = await this.deleteOne({ filter });
        if (!result.ok) {
            throw new MmOperationError({
                code: MmModelErrors.DeleteFailed.code,
                message: MmModelErrors.DeleteFailed.message,
                dbName: this.db.dbName,
                operation: 'delete'
            });
        }
        this.modelData = null;
        this._subscriber.onDeleted(this.modelData, dataFrozen);
        return this;
    }
    catch (err) {
        if (err instanceof MmOperationError)
            throw err;
        throw new MmOperationError({
            code: MmModelErrors.DeleteFailed.code,
            message: `${MmModelErrors.DeleteFailed.message}: ${err instanceof Error ? err.message : 'Unknown error'}`,
            dbName: this.db.dbName,
            operation: 'delete'
        });
    }
}
export default deleteMethod;
