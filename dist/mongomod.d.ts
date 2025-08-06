import MongoSchema from './MongoSchema/index.js';
import MongoController from './MongoController/index.js';
import MongoConnection from './MongoConnection/index.js';
import MongoModel from './MongoModel/index.js';
interface Mongomod {
    models: {
        [key: string]: Function;
    };
    Schema: typeof MongoSchema;
    Controller: typeof MongoController;
    Connection: typeof MongoConnection;
    Model: typeof MongoModel;
    createModel: Function;
}
declare const mongomod: {
    [key: string]: any;
} & Mongomod;
export default mongomod;
