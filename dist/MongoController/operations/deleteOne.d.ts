import MongoController from "../MongoController.js";
import QueryResult from "../../QueryResult.js";
export interface MethodDeleteOneOptions {
    filter: {
        [key: string]: any;
    };
}
declare function deleteOne(this: MongoController, options: MethodDeleteOneOptions): Promise<QueryResult<import("mongodb").WithId<import("bson").Document>> | QueryResult<null>>;
export default deleteOne;
