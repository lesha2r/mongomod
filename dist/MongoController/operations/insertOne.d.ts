import MongoController from '../MongoController.js';
import QueryResult from '../../QueryResult.js';
export interface MethodInsertOneOptions {
    [key: string]: any;
}
declare function insertOne(this: MongoController, data: MethodInsertOneOptions): Promise<QueryResult<any>>;
export default insertOne;
