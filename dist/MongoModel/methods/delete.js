import { MmModelErrCodes, MmModelErrMsgs } from '../../constants/model.js';
import { MmOperationError } from '../../errors/index.js';
async function deleteMethod() {
    this.ensureModelId();
    const dataFrozen = this.data(true);
    try {
        const filter = { _id: this.modelData._id };
        const result = await this.deleteOne({ filter });
        if (!result.ok) {
            throw new MmOperationError({
                code: MmModelErrCodes.DeleteFailed,
                message: MmModelErrMsgs.DeleteFailed,
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
            code: MmModelErrCodes.DeleteFailed,
            message: `${MmModelErrMsgs.DeleteFailed}: ${err instanceof Error ? err.message : 'Unknown error'}`,
            dbName: this.db.dbName,
            operation: 'delete'
        });
    }
}
export default deleteMethod;
