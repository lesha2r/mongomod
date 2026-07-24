import QueryResult from "../../QueryResult.js";
import MongoController from "../MongoController.js";
import { MmAggregationStage } from "../../types/aggregationStages.js";
export type MmAggregationPipeline = MmAggregationStage[];
declare function aggregate(this: MongoController, pipeline: MmAggregationPipeline): Promise<QueryResult<null> | QueryResult<import("bson").Document>>;
export default aggregate;
