import MongoController from "../MongoController.js";
import QueryResult from "../../QueryResult.js";
export interface MethodUpdateManyOptions {
    filter: {
        [key: string]: any;
    };
    update: {
        [key: string]: any;
    };
    params?: {
        upsert?: boolean;
    };
}
declare function updateMany(this: MongoController, options: MethodUpdateManyOptions): Promise<QueryResult<any>>;
export default updateMany;
