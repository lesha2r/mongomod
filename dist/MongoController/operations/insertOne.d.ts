import MongoController from '../MongoController.js';
import QueryResult from '../../QueryResult.js';
export interface MethodInsertOneOptions {
    [key: string]: any;
}
declare function insertOne(this: MongoController, data: MethodInsertOneOptions): Promise<QueryResult<import("mongodb").WithId<import("bson").Document>> | QueryResult<null>>;
export default insertOne;
