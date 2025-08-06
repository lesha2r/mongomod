import QueryResult from "../../QueryResult.js";
import { MmOperationError } from "../../errors/operationError.js";
import { MmOperationErrCodes, MmOperationErrMsgs } from "../../constants/operations.js";
import { MmValidationError } from "../../errors/validationError.js";
import { MmControllerOperations } from "../../constants/controller.js";
const validateAggregationPipeline = (pipeline, dbName) => {
    const areAllObjects = () => pipeline.every(obj => typeof obj === 'object' && obj !== null);
    if (!pipeline || !Array.isArray(pipeline) || pipeline.length === 0 || !areAllObjects()) {
        throw new MmValidationError({
            code: MmOperationErrCodes.WrongAggregatePipeline,
            message: MmOperationErrMsgs.WrongAggregatePipeline,
            dbName: dbName || null,
            operation: MmControllerOperations.Aggregate
        });
    }
    return true;
};
const throwOperationError = (err, dbName) => {
    throw new MmOperationError({
        code: MmOperationErrCodes.OperationFailed,
        message: `${MmOperationErrMsgs.OperationFailed}. ${err.message}`,
        dbName: dbName || null,
        operation: MmControllerOperations.Aggregate,
        originalError: err
    });
};
async function aggregate(pipeline) {
    try {
        validateAggregationPipeline(pipeline, this.db.dbName);
        const collection = this.getCollectionCtrl();
        const result = await collection.aggregate(pipeline).toArray();
        return new QueryResult(true, result);
    }
    catch (err) {
        if (err instanceof MmValidationError)
            throw err;
        throwOperationError(err, this.db.dbName);
        return new QueryResult(false, null);
    }
}
;
export default aggregate;
