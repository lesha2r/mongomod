// ! IN PROCCESS !

import _ from 'lodash';
import MongoSchema from "./MongoSchema.js";
import MongoController from "./MongoController.js";
import MongoConnection from "./MongoConnection.js";
import { ModelErrCodes, ModelErrMsgs } from './constants/model.js';
import { MmValidationError, MmOperationError } from './errors/index.js';

class MongoModel extends MongoController {
    schema: MongoSchema
    modelData: null | {[key: string]: any}
    db: MongoConnection

    constructor(db: MongoConnection, collection: string, schema: MongoSchema) {
        super(db, collection);

        this.collection = collection;
        this.schema = schema;
        this.db = db;

        this.modelData = null;
    }

    data() {
        return this.modelData;
    }

    // Helper method to ensure model has data
    private ensureModelData(): void {
        if (!this.modelData) {
            throw new MmOperationError(
                ModelErrCodes.ModelDataEmpty,
                ModelErrMsgs.ModelDataEmpty,
                this.db.dbName,
                'ensureModelData'
            );
        }
    }

    // Helper method to ensure model has _id
    private ensureModelId(): void {
        this.ensureModelData();

        if (!this.modelData!._id) {
            throw new MmOperationError(
                ModelErrCodes.MissingId,
                ModelErrMsgs.MissingId,
                this.db.dbName,
                'ensureModelId'
            );
        }
    }

    // Filters data by allowedKeys (top-level only)
    dataFiltered(allowedKeys: string[]): { [key: string]: any } | null {
        if (!this.modelData) return null;

        return Object.fromEntries(
            Object.entries(this.modelData)
                .filter(([key]) => allowedKeys.includes(key))
        );
    }

    // Returns modelData as stringified JSON
    toString(): string {
        if (!this.modelData) return ""
        return JSON.stringify(this.modelData);
    }

    // Validates modelData by it's schema
    validate(data: {[key: string]: any} | null = this.modelData) {
        const validationResult = this.schema.validate(data);

        if (validationResult.ok === false) {
            throw new MmValidationError(
                ModelErrCodes.InvalidModelData,
                `${ModelErrMsgs.InvalidModelData}: ${validationResult.failed.join(', ')}`,
                this.db.dbName || null
            )
        }

        // if (this.schema.settings.strict === true) this.clearBySchema();

        return validationResult;
    }

    // Force modelData to have only keys allowed by schema
    clearBySchema(): MongoModel {
        const schema = this.schema.schema;

        if (Object.keys(schema).length === 0) return this;

        const currentModelData = { ...this.modelData };
        let newModelData = {};
        const _id = currentModelData._id;
        
        // Clear top level keys that are not in schema
        for (let key in currentModelData) {
            if (key in schema === false) delete currentModelData[key];
        }
    
        // Loop through the schema, check types, recompile schema
        for (let [key, value] of Object.entries(schema)) {
            newModelData = {
                ...newModelData,
                ...filterDataBySchema(key, value, [])
            };
        }

        this.modelData = newModelData;
        if (_id) this.modelData._id = _id;
    
        // Function needed for recursive calls
        function filterDataBySchema(key: string, value: any, deepKeys: string[] = [], prevResult = {}): {[key:string]: any} {
            let result;
            let handleType = null;

            if (typeof value === 'string') {
                handleType = 'final';
            } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                handleType = 'object';
            } else if (value !== null && typeof value === 'object' && Array.isArray(value)) {
                handleType = 'final';
            }

            switch (handleType) {
            case 'final':
                const caseResult = dynamicSave(currentModelData, key, deepKeys);
                result = _.merge(prevResult, caseResult);
                break;
            case 'object':
                for (let [objKey, objValue] of Object.entries(value)) {
                    const caseResult = filterDataBySchema(
                        objKey,
                        objValue, 
                        [...deepKeys, key ],
                        result
                    );
                    
                    result = _.merge(prevResult, caseResult);
                }
    
                break;
            }

            return result;
        }

        function dynamicSave(dataObj: {[key: string]: any}, key: string, deepKey: string[]) {
            const saveObj: {[key: string]: any} = {};
            let value = dataObj[key];
            
            // If there is a deep key
            if (deepKey.length === 1) {
                value = dataObj[deepKey[0]][key];
    
                if (!saveObj[deepKey[0]]) saveObj[deepKey[0]] = {};
    
                saveObj[deepKey[0]][key] = value;
    
            } else if (deepKey.length > 1) {
                if (!saveObj[deepKey[0]]) saveObj[deepKey[0]] = {};
    
                if (!saveObj[deepKey[0]][deepKey[1]]) {
                    saveObj[deepKey[0]][deepKey[1]] = {};
                }
    
                const lastKey: string = deepKey.pop()!;
                const nestedDataObj = deepKey.reduce((a, prop) => a[prop], dataObj);
                const nestedObj = deepKey.reduce((a, prop) => a[prop], saveObj);
    
                value = nestedDataObj[lastKey][key];
    
                if (!nestedObj[lastKey]) nestedObj[lastKey] = {};
                nestedObj[lastKey][key] = value;
    
            } else {
                saveObj[key] = value;
            }
    
            return saveObj;
        }

        return this;
    }

    // Creates item without saving it to db
    init(data: {[key: string] : any}) {
        this.validate(data);
        this.modelData = data;
        return this;
    }

    // Change item's data
    set(data: {[key: string]: any}) {
        if (!this.modelData) this.modelData = {};

        const newData = { ...this.modelData, ...data };

        this.validate(newData);
        this.modelData = newData;

        return this;
    }

    // Inserts model to db
    async insert(): Promise<MongoModel> {
        this.ensureModelData();

        try {
            const result = await this.insertOne({ data: this.modelData! });

            if (!result.ok) {
                throw new MmOperationError(
                    ModelErrCodes.InsertFailed,
                    ModelErrMsgs.InsertFailed,
                    this.db.dbName,
                    'insert'
                );
            }

            if ('insertedId' in result.result) {
                this.modelData!._id = result.result.insertedId;
            }

            return this;
        } catch (err) {
            // Re-throw our custom errors
            if (err instanceof MmOperationError || err instanceof MmValidationError) {
                throw err;
            }

            // Wrap other errors
            throw new MmOperationError(
                ModelErrCodes.SaveFailed,
                `Failed to insert model to database: ${err instanceof Error ? err.message : 'Unknown error'}`,
                this.db.dbName,
                'insert'
            );
        }
    }

    // Pulls data for the model by the specified query and stores it 
    async get(query: {[key: string]: any} = {}): Promise<MongoModel> {
        try {
            const found = await this.findOne({ query });
            
            if (!found.ok) {
                throw new MmOperationError(
                    ModelErrCodes.GetFailed,
                    ModelErrMsgs.GetFailed,
                    this.db.dbName,
                    'get'
                );
            }

            if (found.result === null || Object.keys(found.result).length === 0) {
                throw new MmOperationError(
                    ModelErrCodes.GetFailed,
                    'No document found matching the provided query',
                    this.db.dbName,
                    'get'
                );
            }
            
            console.log(1, found.result)
            this.modelData = found.result;
            console.log(2, this.modelData) 
            this.validate(this.modelData);
            console.log(3, this.modelData)
            return this;
        } catch (err) {
            // Re-throw our custom errors
            if (err instanceof MmOperationError || err instanceof MmValidationError) {
                throw err;
            }

            // Wrap other errors
            throw new MmOperationError(
                ModelErrCodes.GetFailed,
                `${ModelErrMsgs.GetFailed}: ${err instanceof Error ? err.message : 'Unknown error'}`,
                this.db.dbName,
                'get'
            );
        }
    }

    // Saves current model data into the db
    async save(insertNew: boolean = false): Promise<MongoModel> {
        this.ensureModelData();

        try {
            if (insertNew === true) {
                await this.insert();
            } else {
                this.ensureModelId();

                const result = await this.updateOne({
                    query: { _id: this.modelData!._id },
                    data: this.modelData!
                });

                if (!result.ok) {
                    throw new MmOperationError(
                        ModelErrCodes.SaveFailed,
                        ModelErrMsgs.SaveFailed,
                        this.db.dbName,
                        'save'
                    );
                }
            }

            return this;
        } catch (err) {
            // Re-throw our custom errors
            if (err instanceof MmOperationError || err instanceof MmValidationError) {
                throw err;
            }

            // Wrap other errors
            throw new MmOperationError(
                ModelErrCodes.SaveFailed,
                `${ModelErrMsgs.SaveFailed}: ${err instanceof Error ? err.message : 'Unknown error'}`,
                this.db.dbName,
                'save'
            );
        }
    }

    // Deletes current item from db
    async delete(): Promise<MongoModel> {
        this.ensureModelId();

        try {
            const query = { _id: this.modelData!._id };
            const result = await this.deleteOne({ query });

            // Check if deletion was successful
            if (!result.ok) {
                throw new MmOperationError(
                    ModelErrCodes.DeleteFailed,
                    ModelErrMsgs.DeleteFailed,
                    this.db.dbName,
                    'delete'
                );
            }

            // Clear model data after successful deletion
            this.modelData = null;

            return this;
        } catch (err) {
            // Re-throw custom errors
            if (err instanceof MmOperationError) throw err;

            // Wrap other errors
            throw new MmOperationError(
                ModelErrCodes.DeleteFailed,
                `${ModelErrMsgs.DeleteFailed}: ${err instanceof Error ? err.message : 'Unknown error'}`,
                this.db.dbName,
                'delete'
            );
        }
    }
}   

export default MongoModel;
