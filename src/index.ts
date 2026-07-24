import mongomod from "./mongomod.js";

// Includes
import MongoModel from "./MongoModel/MongoModel.js";
import MongoSchema from "./MongoSchema/MongoSchema.js";
import MongoSubscriber from "./MongoSubscriber/index.js";
import MongoConnection from "./MongoConnection/MongoConnection.js";
import MongoController from "./MongoController/MongoController.js";

// Errors
import { MmValidationError } from './errors/validationError.js';
import { MmOperationError } from './errors/operationError.js';
import { MmControllerError } from "./errors/controllerError.js";
import { MmConnectionError } from "./errors/connectionError.js";

// Extra types
import { MmAggregationStage } from './types/aggregationStages.js';
import{ MmAggregationPipeline } from './MongoController/operations/aggregate.js';

export { MongoSchema, MongoConnection, MongoController, MongoModel, MongoSubscriber };
export { MmValidationError, MmOperationError, MmControllerError, MmConnectionError };
export { MmAggregationStage, MmAggregationPipeline };

export default mongomod;