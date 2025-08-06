import MongoController from '../MongoController.js';
import QueryResult from '../../QueryResult.js';
export interface MethodDistinctOptions {
    field: string;
    filter: {
        [key: string]: any;
    };
}
declare function distinct(this: MongoController, options: MethodDistinctOptions): Promise<QueryResult<any>>;
export default distinct;
