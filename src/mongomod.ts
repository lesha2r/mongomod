import MongoSchema from './MongoSchema.js';
import MongoController from './MongoController.js';
import MongoConnection from './MongoConnection.js';
import MongoModel from './MongoModel.js';
import {keyGenerate} from './utils/index.js';

const enum EReservedMethods {
    Validate = 'validate',
    ClearBySchema = 'clearBySchema',
    Init = 'init',
    Set = 'set',
    Insert = 'insert',
    Get = 'get',
    Save = 'save',
    Delete = 'delete'
}

type TReservedMethods = 
    EReservedMethods.Validate |
    EReservedMethods.ClearBySchema |
    EReservedMethods.Init |
    EReservedMethods.Set |
    EReservedMethods.Insert |
    EReservedMethods.Get |
    EReservedMethods.Save |
    EReservedMethods.Delete |
    'models'


const reservedMethodsNames: TReservedMethods[] = [
    EReservedMethods.Validate,
    EReservedMethods.ClearBySchema,
    EReservedMethods.Init,
    EReservedMethods.Set,
    EReservedMethods.Insert,
    EReservedMethods.Get,
    EReservedMethods.Save,
    EReservedMethods.Delete,
];

type TNotReserved<T> = T extends TReservedMethods ? never : T

type TMongomod = {
    models: {[key: string]: Function}
    Schema: typeof MongoSchema,
    Controller: typeof MongoController
    Connection: typeof MongoConnection
    Model: typeof MongoModel
    createModel: Function
}

const mongomod: {[key: string]: any} & TMongomod= {
    models: {},  
    get: Function,
    Schema: MongoSchema,
    Controller: MongoController,
    Connection: MongoConnection,
    Model: MongoModel,
    createModel(
        db: MongoConnection,
        collection: string,
        schema: MongoSchema,
        customFns: {[key: string]: Function} = {}
    ) {
        if (db instanceof MongoConnection === false) {
            throw new Error('Provided db is not an instance of MongoConnection');
        }

        if (schema !== null && schema instanceof MongoSchema === false) {
            throw new Error('Provided schema is not an instance of MongoSchema');
        } else if (schema === null) {
            schema = new MongoSchema();
        }

        const entries = Object.entries(customFns)
        for (const [key, value] of entries) {
            if ((reservedMethodsNames as ReadonlyArray<string>).includes(key)) {
                throw new Error(`Method name '${key}' is reserved for built-in methods`);
            }

            if (typeof value === 'function') {
                this[key] = value.bind(this);
            } else {
                throw new Error('Custom method must be a function');
            }
        }

        const uniqueId = keyGenerate(8)

        this.models[uniqueId] = function() {
            function InstanceModelCreator(this: any, db: MongoConnection, collection: string, schema: MongoSchema) {
                this.constr = class InstanceModel extends MongoModel {
                    [key: string]: any
                    constructor (db: MongoConnection, collection: string, schema: MongoSchema) {
                        super(db, collection, schema);

                        for (let [key, value] of Object.entries(customFns)) {
                            if (typeof value === 'function') {
                                this[key] = value.bind(this);
                            } else {
                                throw new Error('Custom method must be a function');
                            }
                        }
                    }

                    // /**
                    //  * Adds custom method to a model.
                    //  * @param { String } methodName name of the method. Could be invoked later by Model.custom.methodName 
                    //  * @param { Function } func function to be executed on call
                    //  */
                    // addCustomMethod(methodName, func) {
                    //     this.custom[methodName] = func.bind(this);
                    // }
                };

                return new this.constr(db, collection, schema);
            };

            // @ts-ignore
            if (new.target) return new InstanceModelCreator(db, collection, schema);
            else throw new Error('Class constructor cannot be invoked without "new"');
        };
        
        return this.models[uniqueId];
    }
};

export default mongomod;