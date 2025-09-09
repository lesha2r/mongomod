import QueryResult from "../../QueryResult.js";
import MongoController from "../MongoController.js";
import { AggregationStage } from "../../types/aggregationStages.js";
export type AggregationPipeline = AggregationStage[];
declare function aggregate(this: MongoController, pipeline: AggregationPipeline): Promise<QueryResult<any>>;
export default aggregate;
