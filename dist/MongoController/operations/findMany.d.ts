import MongoController from '../MongoController.js';
import QueryResult from '../../QueryResult.js';
export interface MethodFindManyOptions {
    filter: {
        [key: string]: any;
    };
    limit?: number;
    skip?: number;
}
declare function findMany(this: MongoController, options: MethodFindManyOptions): Promise<QueryResult<import("mongodb").WithId<import("bson").Document>> | QueryResult<null>>;
export default findMany;
