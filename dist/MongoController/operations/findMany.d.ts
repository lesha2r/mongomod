import MongoController from '../MongoController.js';
import QueryResult from '../../QueryResult.js';
export interface MethodFindManyOptions {
    filter: {
        [key: string]: any;
    };
    limit?: number;
    skip?: number;
    sort?: {
        [key: string]: 1 | -1;
    };
    project?: {
        [key: string]: 0 | 1;
    };
}
declare function findMany(this: MongoController, options: MethodFindManyOptions): Promise<QueryResult<null> | QueryResult<import("mongodb").WithId<import("bson").Document>>>;
export default findMany;
