import QueryResult from '../../QueryResult.js';
import MongoController from '../MongoController.js';
export type MethodBulkWriteOptions = any[];
declare function bulkWrite(this: MongoController, operations: MethodBulkWriteOptions): Promise<QueryResult<any>>;
export default bulkWrite;
