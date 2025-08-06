import QueryResult from '../../QueryResult.js';
import MongoController from '../MongoController.js';
export interface MethodInsertManyOptions {
    data: {
        [key: string]: any;
    }[];
    ordered?: boolean;
}
declare function insertMany(this: MongoController, options: MethodInsertManyOptions): Promise<QueryResult<any>>;
export default insertMany;
