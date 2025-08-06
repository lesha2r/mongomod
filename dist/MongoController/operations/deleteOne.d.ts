import MongoController from "../MongoController.js";
import QueryResult from "../../QueryResult.js";
export interface MethodDeleteOneOptions {
    filter: {
        [key: string]: any;
    };
}
declare function deleteOne(this: MongoController, options: MethodDeleteOneOptions): Promise<QueryResult<null> | QueryResult<import("mongodb").ModifyResult<import("bson").Document>>>;
export default deleteOne;
