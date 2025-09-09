import MongoController from '../MongoController.js';
import QueryResult from '../../QueryResult.js';
export interface MethodFindOneOptions {
    filter: {
        [key: string]: any;
    };
    limit?: number;
    skip?: number;
}
declare function findOne(this: MongoController, options: MethodFindOneOptions): Promise<QueryResult<any>>;
export default findOne;
