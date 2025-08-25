import MongoSchema from './MongoSchema/index.js';
import MongoController from './MongoController/index.js';
import MongoConnection from './MongoConnection/index.js';
import MongoModel from './MongoModel/index.js';
import { validateCustomMethods, validateDbInstance, validateSchema } from './utils/mongomod.js';
import findOne from './MongoController/operations/findOne.js';
import findMany from './MongoController/operations/findMany.js';
import insertOne from './MongoController/operations/insertOne.js';
import insertMany from './MongoController/operations/insertMany.js';
import updateOne from './MongoController/operations/updateOne.js';
import updateMany from './MongoController/operations/updateMany.js';
import deleteOne from './MongoController/operations/deleteOne.js';
import deleteMany from './MongoController/operations/deleteMany.js';
import count from './MongoController/operations/count.js';
import aggregate from './MongoController/operations/aggregate.js';
import distinct from './MongoController/operations/distinct.js';
import bulkWrite from './MongoController/operations/bulkWrite.js';
import MongoSubscriber from './MongoSubscriber/index.js';
const mongomod = {
    models: {},
    get: Function,
    Schema: MongoSchema,
    Controller: MongoController,
    Connection: MongoConnection,
    Model: MongoModel,
    createModel(options) {
        validateDbInstance(options.db);
        validateSchema(options.schema);
        validateCustomMethods(options.customs);
        const { db, collection, schema, customs } = options;
        const schemaHandled = !schema ? new MongoSchema() : schema;
        class CustomModel extends MongoModel {
            constructor(args) {
                const constructorParams = {
                    db,
                    collection,
                    schema: schemaHandled,
                    customs,
                    subscriber: {},
                    ...args
                };
                super(constructorParams);
                Object.assign(this, customs);
            }
            static _subscriber = new MongoSubscriber('TestId10129309120312903');
            _subscriber = CustomModel._subscriber;
            static subscribe = CustomModel._subscriber.subscribe;
            static dbController = new MongoController(db, collection);
            static findOne = (options) => findOne.call(CustomModel.dbController, options);
            static findMany = (options) => findMany.call(CustomModel.dbController, options);
            static insertOne = (data) => insertOne.call(CustomModel.dbController, data);
            static insertMany = (data) => insertMany.call(CustomModel.dbController, data);
            static updateOne = (data) => updateOne.call(CustomModel.dbController, data);
            static updateMany = (options) => updateMany.call(CustomModel.dbController, options);
            static deleteOne = (options) => deleteOne.call(CustomModel.dbController, options);
            static deleteMany = (options) => deleteMany.call(CustomModel.dbController, options);
            static count = (options) => count.call(CustomModel.dbController, options);
            static aggregate = (pipeline) => aggregate.call(CustomModel.dbController, pipeline);
            static distinct = (options) => distinct.call(CustomModel.dbController, options);
            static bulkWrite = (options) => bulkWrite.call(CustomModel.dbController, options);
        }
        return CustomModel;
    }
};
export default mongomod;
