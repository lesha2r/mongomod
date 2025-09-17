import QueryResult from "../../QueryResult.js";
import MongoController from "../MongoController.js";
export interface MethodDeleteOptions {
    filter: {
        [key: string]: any;
    };
}
declare function deleteMany(this: MongoController, options: MethodDeleteOptions): Promise<QueryResult<null> | QueryResult<import("mongodb").DeleteResult>>;
export default deleteMany;
