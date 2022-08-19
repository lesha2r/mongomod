import MongoSchema from './MongoSchema.js';
import MongoController from './MongoController.js';
import MongoConnection from './MongoConnection.js';
import MongoModel from './MongoModel.js';

const reservedMethodsNames = ['validate', 'clearBySchema', 'init', 'set', 'insert', 'get', 'save', 'delete'];

const monmodel = {
    models: {},  
    Schema: MongoSchema,
    Controller: MongoController,
    Connection: MongoConnection,
    Model: MongoModel,
    createModel(db, collection, schema, customFns = {}) {

        if (db instanceof MongoConnection === false) {
            throw new Error('Provided db is not an instance of MongoConnection');
        }

        if (schema !== null && schema instanceof MongoSchema === false) {
            throw new Error('Provided schema is not an instance of MongoSchema');
        } else if (schema === null) schema = new MongoSchema();

        for (let [key, value] of Object.entries(customFns)) {
            if (reservedMethodsNames.includes(key)) {
                throw new Error('Method name "' + key + '" is reserved for built-in methods');
            }

            if (typeof value === 'function') {
                this[key] = value.bind(this);
            } else throw new Error('Custom method must be a function');
        }

        // TODO: replace by id
        let uniqueId = '' + randomNumber() + randomNumber() + randomNumber() + randomNumber();

        this.models[uniqueId] = function() {
            function InstanceModelCreator(db, collection, schema) {
                this.constr = class InstanceModel extends MongoModel {
                    constructor (db, collection, schema) {
                        super(db, collection, schema);

                        for (let [key, value] of Object.entries(customFns)) {
                            if (typeof value === 'function') {
                                this[key] = value.bind(this);
                            } else throw new Error('Custom method must be a function');
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

            if (new.target) return new InstanceModelCreator(db, collection, schema);
            else throw new Error('Class constructor cannot be invoked without "new"');
        };
        
        return this.models[uniqueId];
    }
};

const randomNumber = () => Math.floor(Math.random() * 100);

export default monmodel;