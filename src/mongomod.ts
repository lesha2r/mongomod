import MongoSchema from './MongoSchema.js';
import MongoController from './MongoController.js';
import MongoConnection from './MongoConnection.js';
import MongoModel, {MongoModelOptions} from './MongoModel.js';
import { validateDbInstance, validateSchema } from './utils/mongomod.js';

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

        const { db, collection, schema, customs = {} } = options;

        const schemaHandled = !schema ? new MongoSchema() : schema;

        return new Proxy(MongoModel, {
            construct(target, args) {
                // Merge customMethods into the instance
                const instance = new target({db, collection, schema: schemaHandled, customs});
                Object.assign(instance, customs);
                return instance as MongoModel;
            }
        }) as unknown as MongoModel;
    }
};

export default mongomod;