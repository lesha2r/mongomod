import _ from 'lodash';
import MongoSchema from "./MongoSchema.js";
import MongoController from "./MongoController.js";
import MongoConnection from "./MongoConnection.js";
import { ModelErrCodes, ModelErrMsgs } from './constants/model.js';
import { MmValidationError, MmOperationError } from './errors/index.js';
import { MongomodErrCodes, MongomodErrMsgs } from './constants/mongomod.js';
import { filterObject } from './utils/index.js';
import { ObjectId } from 'mongodb';
import { MethodFindOneOptions } from './methods/findOne.js';
import { MethodFindManyOptions } from './methods/findMany.js';
import { MethodDistinctOptions } from './methods/distinct.js';
import { MethodBulkWriteOptions } from './methods/bulkWrite.js';
import { MethodCountOptions } from './methods/count.js';
import { AggregationPipeline } from './methods/aggregate.js';
import { MethodInsertManyOptions } from './methods/insertMany.js';
import { MethodDeleteOptions } from './methods/deleteMany.js';
import { MethodUpdateManyOptions } from './methods/updateMany.js';
import { MethodDeleteOneOptions } from './methods/deleteOne.js';
import { MethodUpdateOneOptions } from './methods/updateOne.js';
import { MethodInsertOneOptions } from './methods/insertOne.js';

const throwCustomMethodError = (methodName: string) => {
    throw new MmValidationError({
        code: MongomodErrCodes.CustomMethodNotFunction,
        message: `${MongomodErrMsgs.CustomMethodNotFunction}: ${methodName}`,
    });
}

const throwCustomMethodErrorIfNeeded = (failedMethods: string[]) => {
    if (failedMethods.length > 0) return

    throwCustomMethodError(failedMethods.join(', '));
}

function parseCustomMethods(this: MongoModel, customMethods: Record<string, any> | undefined) {
    // Check custom methods and throw if any are not functions
    const failedMethods = []
    
    for (let [key, value] of Object.entries(customMethods || {})) {
        if (typeof value === 'function') {
            this[key] = value.bind(this);
        } else {
            failedMethods.push(key);
        }
    }

    throwCustomMethodErrorIfNeeded(failedMethods);
}

export interface MongoModelOptions {
    db: MongoConnection,
    collection: string,
    schema?: MongoSchema,
    customs?: Record<string, Function>
}

class MongoModel extends MongoController {
    [key: string]: any
    db: MongoConnection
    schema?: MongoSchema | null
    collection: string;
    modelData: null | Record<string, any>

    constructor(inputOptions: MongoModelOptions) {
        const {
            db,
            collection,
            schema = null,
            customs = {}
        } = inputOptions;

        super(db, collection);

        this.collection = collection;
        this.schema = schema;
        this.db = db;

        this.modelData = null;

        parseCustomMethods.call(this, customs);
    }

    data() {
        return this.modelData;
    }

    static findOne(options: MethodFindOneOptions): any {
        return this.findOne(options)
    }

    static findMany(options: MethodFindManyOptions): any {
        return this.findMany(options)
    }

    static insertOne(options: MethodInsertOneOptions): any {
        return this.insertOne(options)
    }

    static updateOne(options: MethodUpdateOneOptions): any {
        return this.updateOne(options)
    }

    static deleteOne(options: MethodDeleteOneOptions): any {
        return this.deleteOne(options)
    }

    static updateMany(options: MethodUpdateManyOptions): any {
        return this.updateMany(options)
    }

    static deleteMany(options: MethodDeleteOptions): any {
        return this.deleteMany(options)
    }

    static insertMany(options: MethodInsertManyOptions): any {
        return this.insertMany(options)
    }

    static aggregate(options: AggregationPipeline): any {
        return this.aggregate(options)
    }

    static count(options: MethodCountOptions): any {
        return this.count(options)
    }

    static bulkWrite(options: MethodBulkWriteOptions): any {
        return this.bulkWrite(options)
    }

    static distinct(options: MethodDistinctOptions): any {  
        return this.distinct(options)
    }

    // Helper method to ensure model has data
    private ensureModelData(): boolean {
        if (this.modelData) return true;

        throw new MmOperationError({
            code: ModelErrCodes.ModelDataEmpty,
            message: ModelErrMsgs.ModelDataEmpty,
            dbName: this.db.dbName,
            operation: 'ensureModelData'
        });
    }

    // Helper method to ensure model has _id
    private ensureModelId(): boolean {
        this.ensureModelData();

        if (this.modelData && this.modelData._id) return true;
        
        throw new MmOperationError({
            code: ModelErrCodes.MissingId,
            message: ModelErrMsgs.MissingId,
            dbName: this.db.dbName,
            operation: 'ensureModelId'
        });

    }

    // Filters data by provided keys (top-level only)
    dataFiltered(allowedKeys: string[]): { [key: string]: any } | null {
        if (!this.modelData) return null;

        return filterObject(this.modelData, allowedKeys);
    }

    // Returns modelData as stringified JSON
    toString(): string {
        if (!this.modelData) return ""
        return JSON.stringify(this.modelData);
    }

    // Validates modelData by it's schema
    validate(data: {[key: string]: any} | null = this.modelData) {
        if (!this.schema) return null

        const validationResult = this.schema.validate(data);

        if (validationResult.ok === false) {
            throw new MmValidationError({
                code: ModelErrCodes.InvalidModelData,
                message: `${ModelErrMsgs.InvalidModelData}: ${validationResult.failed.join(', ')}`,
                dbName: this.db.dbName || null
            });
        }

        // if (this.schema.settings.strict === true) this.clearBySchema();

        return validationResult;
    }

    // Force modelData to have only keys allowed by schema
    clearBySchema(): MongoModel {
        if (!this.schema) return this;
        const schema = this.schema.schema;

        if (Object.keys(schema).length === 0) return this;
        if (!this.modelData) return this;

        const currentModelData = _.cloneDeep(this.modelData);
        
        let newModelData = {};
        const _id = currentModelData._id instanceof ObjectId ? currentModelData._id : new ObjectId(currentModelData._id);

        // TODO: Deep sanitization
        // Keep only keys defined in schema (top-level only)
        for (let key in currentModelData) {
            if (key in schema === false) delete currentModelData[key];
        }

        this.modelData = newModelData;
        if (_id) this.modelData._id = _id;
    

        return this;
    }

    // Creates item without saving it to db
    init(data: Record<string, any>): MongoModel {
        this.validate(data);

        this.modelData = data;

        return this;
    }

    set(data: Record<string, any>): MongoModel {
        if (!this.modelData) this.modelData = {};

        // suggest realization
        const updatedModelData = { ...this.modelData, ...data };

        this.validate(updatedModelData);
        this.modelData = updatedModelData;

        return this;
    }

    // Inserts model to db
    async insert(): Promise<MongoModel> {
        this.ensureModelData();

        try {
            const result = await this.insertOne({ data: this.modelData! });

            if (!result.ok) {
                throw new MmOperationError({
                    code: ModelErrCodes.InsertFailed,
                    message: ModelErrMsgs.InsertFailed,
                    dbName: this.db.dbName,
                    operation: 'insert'
                });
            }

            if (result.data && 'insertedId' in result.data) {
                this.modelData!._id = result.data.insertedId;
            }

            return this;
        } catch (err) {
            // Re-throw our custom errors
            if (err instanceof MmOperationError || err instanceof MmValidationError) {
                throw err;
            }

            // Wrap other errors
            throw new MmOperationError({
                code: ModelErrCodes.SaveFailed,
                message: `Failed to insert model to database: ${err instanceof Error ? err.message : 'Unknown error'}`,
                dbName: this.db.dbName,
                operation: 'insert'
            });
        }
    }

    // Pulls data for the model by the specified filter and stores it 
    async get(filter: {[key: string]: any} = {}): Promise<MongoModel> {
        try {
            const found = await this.findOne({ filter });
            
            if (!found.ok) {
                throw new MmOperationError({
                    code: ModelErrCodes.GetFailed,
                    message: ModelErrMsgs.GetFailed,
                    dbName: this.db.dbName,
                    operation: 'get'
                });
            }

            if (found.data === null || Object.keys(found.data).length === 0) {
                throw new MmOperationError({
                    code: ModelErrCodes.GetFailed,
                    message: 'No document found matching the provided filter',
                    dbName: this.db.dbName,
                    operation: 'get'
                });
            }
            
            this.modelData = found.data;
            this.validate(this.modelData);

            return this;
        } catch (err) {
            // Re-throw our custom errors
            if (err instanceof MmOperationError || err instanceof MmValidationError) {
                throw err;
            }

            // Wrap other errors
            throw new MmOperationError({
                code: ModelErrCodes.GetFailed,
                message: `${ModelErrMsgs.GetFailed}: ${err instanceof Error ? err.message : 'Unknown error'}`,
                dbName: this.db.dbName,
                operation: 'get'
            });
        }
    }

    // Saves current model data into the db
    async save(insertIfNotExists: boolean = false): Promise<MongoModel> {
        this.ensureModelData();

        try {
            if (insertIfNotExists === true) {
                await this.insert();
            } else {
                this.ensureModelId();

                const result = await this.updateOne({
                    filter: { _id: this.modelData!._id },
                    update: this.modelData!
                });

                if (!result.ok) {
                    throw new MmOperationError({
                        code: ModelErrCodes.SaveFailed,
                        message: ModelErrMsgs.SaveFailed,
                        dbName: this.db.dbName,
                        operation: 'save'
                    });
                }
            }

            return this;
        } catch (err) {
            // Re-throw our custom errors
            if (err instanceof MmOperationError || err instanceof MmValidationError) {
                throw err;
            }

            // Wrap other errors
            throw new MmOperationError({
                code: ModelErrCodes.SaveFailed,
                message: `${ModelErrMsgs.SaveFailed}: ${err instanceof Error ? err.message : 'Unknown error'}`,
                dbName: this.db.dbName,
                operation: 'save'
            });
        }
    }

    // Deletes current item from db
    async delete(): Promise<MongoModel> {
        this.ensureModelId();

        try {
            const filter = { _id: this.modelData!._id };
            const result = await this.deleteOne({ filter });

            // Check if deletion was successful
            if (!result.ok) {
                throw new MmOperationError({
                    code: ModelErrCodes.DeleteFailed,
                    message: ModelErrMsgs.DeleteFailed,
                    dbName: this.db.dbName,
                    operation: 'delete'
                });
            }

            // Clear model data after successful deletion
            this.modelData = null;

            return this;
        } catch (err) {
            // Re-throw custom errors
            if (err instanceof MmOperationError) throw err;

            // Wrap other errors
            throw new MmOperationError({
                code: ModelErrCodes.DeleteFailed,
                message: `${ModelErrMsgs.DeleteFailed}: ${err instanceof Error ? err.message : 'Unknown error'}`,
                dbName: this.db.dbName,
                operation: 'delete'
            });
        }
    }
}   

export default MongoModel;
