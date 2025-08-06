import MongoModel from '../MongoModel.js';
declare function get(this: MongoModel, filter?: {
    [key: string]: any;
}): Promise<MongoModel>;
export default get;
