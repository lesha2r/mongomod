import QueryResult from "../../QueryResult.js";

import { MmOperationError } from "../../errors/operationError.js";
import MongoController from "../MongoController.js";
import { AggregationStage } from "../../types/aggregationStages.js";
import { MmValidationError } from "../../errors/validationError.js";
import { MmControllerOperations } from "../../constants/controller.js";
import { MmOperationErrors } from "../../constants/operations.js";

export type AggregationPipeline = AggregationStage[]

const validateAggregationPipeline = (pipeline: AggregationPipeline, dbName?: string): boolean => {    
    const areAllObjects = () => pipeline.every(obj => typeof obj === 'object' && obj !== null);

    if (!pipeline || !Array.isArray(pipeline) || pipeline.length === 0 || !areAllObjects()) {
        throw new MmValidationError({
            code: MmOperationErrors.WrongAggregatePipeline.code,
            message: MmOperationErrors.WrongAggregatePipeline.message,
            dbName: dbName || null,
            operation: MmControllerOperations.Aggregate
        });
    }

    return true;
}

const throwOperationError = (err: any, dbName?: string): MmOperationError => {
    throw new MmOperationError({
        code: MmOperationErrors.OperationFailed.code,
        message: `${MmOperationErrors.OperationFailed.message}. ${err.message}`,
        dbName: dbName || null,
        operation: MmControllerOperations.Aggregate,
        originalError: err
    });
}

async function aggregate(this: MongoController, pipeline: AggregationPipeline) {
    try {
        validateAggregationPipeline(pipeline, this.db.dbName);

        const collection = this.getCollectionCtrl();
        const result = await collection.aggregate(pipeline).toArray();
        
        return new QueryResult(true, result);
    } catch (err: any) {
        if (err instanceof MmValidationError) throw err;
        throwOperationError(err, this.db.dbName);

        // This line is unreachable but included for type consistency
        return new QueryResult(false, null);
    }
};

export default aggregate