import MongoController from "../MongoController.js";
import QueryResult from "../../QueryResult.js";
export type MethodEnsureIndexOptions = {
    keys: string[];
}[];
export interface MethodEnsureIndexResult {
    isChecked: boolean;
    byKeys: {
        [key: string]: boolean;
    };
    passed: string[];
    failed: string[];
}
declare function ensureIndex(this: MongoController, checkIndexesArr: MethodEnsureIndexOptions): Promise<QueryResult<null> | QueryResult<MethodEnsureIndexResult>>;
export default ensureIndex;
