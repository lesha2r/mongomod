import MongoSchema from './MongoSchema/index.js';
import MongoController from './MongoController/index.js';
import MongoConnection from './MongoConnection/index.js';
import MongoModel, {MongoModelOptions} from './MongoModel/index.js';
import { validateCustomMethods, validateDbInstance, validateSchema } from './utils/mongomod.js';
import findOne, { MethodFindOneOptions } from './MongoController/operations/findOne.js';
import findMany, { MethodFindManyOptions } from './MongoController/operations/findMany.js';
import insertOne, { MethodInsertOneOptions } from './MongoController/operations/insertOne.js';
import insertMany, { MethodInsertManyOptions } from './MongoController/operations/insertMany.js';
import updateOne, { MethodUpdateOneOptions } from './MongoController/operations/updateOne.js';
import updateMany, { MethodUpdateManyOptions } from './MongoController/operations/updateMany.js';
import deleteOne, { MethodDeleteOneOptions } from './MongoController/operations/deleteOne.js';
import deleteMany, { MethodDeleteOptions } from './MongoController/operations/deleteMany.js';
import count, { MethodCountOptions } from './MongoController/operations/count.js';
import aggregate, { AggregationPipeline } from './MongoController/operations/aggregate.js';
import distinct, { MethodDistinctOptions } from './MongoController/operations/distinct.js';
import bulkWrite, { MethodBulkWriteOptions } from './MongoController/operations/bulkWrite.js';
import MongoSubscriber from './MongoSubscriber/index.js';

interface Mongomod {
    models: {[key: string]: Function}
    Schema: typeof MongoSchema,
    Controller: typeof MongoController
    Connection: typeof MongoConnection
    Model: typeof MongoModel
    createModel: Function
}

const mongomod: {[key: string]: any} & Mongomod = {
    models: {},  
    get: Function,
    Schema: MongoSchema,
    Controller: MongoController,
    Connection: MongoConnection,
    Model: MongoModel,
    createModel(options: MongoModelOptions): MongoModel {
        validateDbInstance(options.db);
        validateSchema(options.schema);
        validateCustomMethods(options.customs);
        console.log(options.customs)

        const { db, collection, schema, customs } = options;
        const schemaHandled = !schema ? new MongoSchema() : schema;

        // Create a new class that extends MongoModel
        class CustomModel extends MongoModel {
            constructor(args?: any) {
                const constructorParams = {
                    db,
                    collection,
                    schema: schemaHandled,
                    customs,
                    subscriber: {},
                    ...args
                }

                super(constructorParams);

                Object.assign(this, customs);
            }
            
            static _subscriber = new MongoSubscriber('TestId10129309120312903')
            _subscriber = CustomModel._subscriber
            static subscribe = CustomModel._subscriber.subscribe

            // ** Static method for using controller through the created Model
            static dbController = new MongoController(db, collection)
            static findOne = (options: MethodFindOneOptions) => findOne.call(CustomModel.dbController, options)
            static findMany = (options: MethodFindManyOptions) => findMany.call(CustomModel.dbController, options)
            static insertOne = (data: MethodInsertOneOptions) => insertOne.call(CustomModel.dbController, data)
            static insertMany = (data: MethodInsertManyOptions) => insertMany.call(CustomModel.dbController, data)
            static updateOne = (data: MethodUpdateOneOptions) => updateOne.call(CustomModel.dbController, data)
            static updateMany = (options: MethodUpdateManyOptions) => updateMany.call(CustomModel.dbController, options)
            static deleteOne = (options: MethodDeleteOneOptions) => deleteOne.call(CustomModel.dbController, options)
            static deleteMany = (options: MethodDeleteOptions) => deleteMany.call(CustomModel.dbController, options)
            static count = (options: MethodCountOptions) => count.call(CustomModel.dbController, options)
            static aggregate = (pipeline: AggregationPipeline) => aggregate.call(CustomModel.dbController, pipeline)
            static distinct = (options: MethodDistinctOptions) => distinct.call(CustomModel.dbController, options)
            static bulkWrite = (options: MethodBulkWriteOptions) => bulkWrite.call(CustomModel.dbController, options)
        }
        
        return CustomModel as unknown as MongoModel;
    }
};

export default mongomod;