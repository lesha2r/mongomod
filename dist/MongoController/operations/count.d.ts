import MongoController from '../MongoController.js';
import QueryResult from '../../QueryResult.js';
export interface MethodCountOptions {
    filter?: {
        [key: string]: any;
    };
}
declare function count(this: MongoController, options?: MethodCountOptions): Promise<QueryResult<any>>;
export default count;
