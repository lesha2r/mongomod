import QueryResult from "../../QueryResult.js";
import MongoController from "../MongoController.js";
export interface MethodDeleteOptions {
    filter: {
        [key: string]: any;
    };
}
declare function deleteMany(this: MongoController, options: MethodDeleteOptions): Promise<QueryResult<any>>;
export default deleteMany;
