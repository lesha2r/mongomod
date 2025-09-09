import MongoController from '../MongoController.js';
import QueryResult from '../../QueryResult.js';
export type MethodUpdateOneOptions = {
    filter: {
        [key: string]: any;
    };
    update: {
        [key: string]: any;
    };
    params?: {
        upsert?: boolean;
    };
};
declare function updateOne(this: MongoController, options: MethodUpdateOneOptions): Promise<QueryResult<any>>;
export default updateOne;
