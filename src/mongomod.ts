// ** DONE **

import MongoSchema from './MongoSchema.js';
import MongoController from './MongoController.js';
import MongoConnection from './MongoConnection.js';
import MongoModel from './MongoModel.js';
import {keyGenerate} from './utils/index.js'
import { MmValidationError } from './errors/validation.js';
import { MongomodErrorCodes, MongomodErrorMessages } from './constants/mongomod.js';
import { ensureMethodNameIsNotReserved, validateDbInstance, validateSchema } from './utils/mongomod.js';

interface Mongomod {
    models: {[key: string]: Function}
    Schema: typeof MongoSchema,
    Controller: typeof MongoController
    Connection: typeof MongoConnection
    Model: typeof MongoModel
    createModel: Function
}

class InstanceModel extends MongoModel {
    [key: string]: any
    constructor (db: MongoConnection, collection: string, schema: MongoSchema) {
        super(db, collection, schema);

        for (let [key, value] of Object.entries(this.customFns || {})) {
            if (typeof value === 'function') {
                this[key] = value.bind(this);
            } else {
                throw new MmValidationError(
                    MongomodErrorCodes.CustomMethodNotFunction,
                    MongomodErrorMessages.CustomMethodNotFunction,
                );
            }
        }
    }

    static test() {
        console.log('TESTING INSTANCE MODEL');
    }
};

const mongomod: {[key: string]: any} & Mongomod= {
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
        validateDbInstance(db);
        validateSchema(schema);

        const schemaHandled = !schema ? new MongoSchema() : schema;
        const uniqueId = keyGenerate(12)

        const entries = Object.entries(customFns)
        for (const [key, value] of entries) {
            ensureMethodNameIsNotReserved(key);

            if (typeof value === 'function') {
                this[key] = value.bind(this);
            } else {
                throw new MmValidationError(MongomodErrorCodes.CustomMethodNotFunction, MongomodErrorMessages.CustomMethodNotFunction);
            }
        }

        this.models[uniqueId] = function() {
            if (new.target) return new InstanceModel(db, collection, schemaHandled);
            else throw new MmValidationError(MongomodErrorCodes.CannotUsedWithoutNew, MongomodErrorMessages.CannotUsedWithoutNew);
            //else return InstanceModel(db, collection, schemaHandled);
        };
        
        return this.models[uniqueId];
    }
};

export default mongomod;