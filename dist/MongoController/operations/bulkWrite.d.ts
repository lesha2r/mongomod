import QueryResult from '../../QueryResult.js';
import MongoController from '../MongoController.js';
export type MethodBulkWriteOptions = any[];
declare function bulkWrite(this: MongoController, operations: MethodBulkWriteOptions): Promise<QueryResult<null> | QueryResult<import("mongodb").BulkWriteResult>>;
export default bulkWrite;
