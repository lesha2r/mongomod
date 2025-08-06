import MongoModel from '../MongoModel.js';
declare function save(this: MongoModel, insertIfNotExists?: boolean): Promise<MongoModel>;
export default save;
