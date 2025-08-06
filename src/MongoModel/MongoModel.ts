import _ from 'lodash';
import { ObjectId } from 'mongodb';
import { filterObject } from '../utils/common.js';
import _constructorUtils from './utils/constructor.utils.js';

import MongoSchema from "../MongoSchema/index.js";
import MongoController from "../MongoController/index.js";
import MongoConnection from "../MongoConnection/index.js";

import { MmModelErrCodes, MmModelErrMsgs } from '../constants/model.js';
import { MmOperationError } from '../errors/index.js';

import { MethodFindOneOptions } from '../MongoController/operations/findOne.js';
import { MethodFindManyOptions } from '../MongoController/operations/findMany.js';
import { MethodDistinctOptions } from '../MongoController/operations/distinct.js';
import { MethodBulkWriteOptions } from '../MongoController/operations/bulkWrite.js';
import { MethodCountOptions } from '../MongoController/operations/count.js';
import { AggregationPipeline } from '../MongoController/operations/aggregate.js';
import { MethodInsertManyOptions } from '../MongoController/operations/insertMany.js';
import { MethodDeleteOptions } from '../MongoController/operations/deleteMany.js';
import { MethodUpdateManyOptions } from '../MongoController/operations/updateMany.js';
import { MethodDeleteOneOptions } from '../MongoController/operations/deleteOne.js';
import { MethodUpdateOneOptions } from '../MongoController/operations/updateOne.js';
import { MethodInsertOneOptions } from '../MongoController/operations/insertOne.js';

// Methods
import clearBySchema from './methods/cleaBySchema.js';
import init from './methods/init.js';
import set from './methods/set.js';
import insert from './methods/insert.js';
import get from './methods/get.js';
import save from './methods/save.js';
import deleteMethod from './methods/delete.js';
import validate from './methods/validate.js';

export interface MongoModelOptions {
    db: MongoConnection,
    collection: string,
    schema?: MongoSchema,
    customs?: Record<string, Function>
}

const MongoModelMethods = {
    FindOne: 'findOne',
    FindMany: 'findMany',
    InsertOne: 'insertOne',
    UpdateOne: 'updateOne',
    DeleteOne: 'deleteOne',
    UpdateMany: 'updateMany',
    DeleteMany: 'deleteMany',
    InsertMany: 'insertMany',
    Aggregate: 'aggregate',
    Count: 'count',
    BulkWrite: 'bulkWrite',
    Distinct: 'distinct'
}

export type MongoModelMethodNames = keyof typeof MongoModelMethods;

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
            customs 
        } = inputOptions;

        super(db, collection);

        this.collection = collection;
        this.schema = schema;
        this.db = db;

        this.modelData = null;

        _constructorUtils.parseCustomMethods.call(this, customs);
    }

    protected _modelDataBeforeSave: Record<string, any> | null = null;

    // static findMany(options: MethodFindManyOptions): any {
    //     return this.findMany(options)
    // }

    // static insertOne(options: MethodInsertOneOptions): any {
    //     return this.insertOne(options)
    // }

    // static updateOne(options: MethodUpdateOneOptions): any {
    //     return this.updateOne(options)
    // }

    // static deleteOne(options: MethodDeleteOneOptions): any {
    //     return this.deleteOne(options)
    // }

    // static updateMany(options: MethodUpdateManyOptions): any {
    //     return this.updateMany(options)
    // }

    // static deleteMany(options: MethodDeleteOptions): any {
    //     return this.deleteMany(options)
    // }

    // static insertMany(options: MethodInsertManyOptions): any {
    //     return this.insertMany(options)
    // }

    // static aggregate(options: AggregationPipeline): any {
    //     return this.aggregate(options)
    // }

    // static count(options: MethodCountOptions): any {
    //     return this.count(options)
    // }

    // static bulkWrite(options: MethodBulkWriteOptions): any {
    //     return this.bulkWrite(options)
    // }

    // static distinct(options: MethodDistinctOptions): any {  
    //     return this.distinct(options)
    // }

    // Helper method to ensure model has data
    protected ensureModelData(): boolean {
        if (this.modelData) return true;

        throw new MmOperationError({
            code: MmModelErrCodes.ModelDataEmpty,
            message: MmModelErrMsgs.ModelDataEmpty,
            dbName: this.db.dbName,
            operation: 'ensureModelData'
        });
    }

    // Helper method to ensure model has _id
    protected ensureModelId(): boolean {
        this.ensureModelData();

        if (this.modelData && this.modelData._id) return true;
        
        throw new MmOperationError({
            code: MmModelErrCodes.MissingId,
            message: MmModelErrMsgs.MissingId,
            dbName: this.db.dbName,
            operation: 'ensureModelId'
        });
    }

    // ** MongoModel methods **
    data(clone: boolean = false): Record<string, any> | null {
        if (!this.modelData) return null;
        if (clone) return JSON.parse(JSON.stringify(this.modelData)); // Deep clone
        return this.modelData
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
        return validate.call(this, data);
    }

    // Creates item without saving it to db
    init(data: Record<string, any>): MongoModel {
        return init.call(this, data)
    }

    // Force modelData to have only keys allowed by schema
    clearBySchema(): MongoModel {
        return clearBySchema.call(this)
    }

    set(data: Record<string, any>): MongoModel {
        return set.call(this, data);
    }

    // Inserts model to db
    async insert(): Promise<MongoModel> {
        return insert.call(this);
    }

    // Pulls data for the model by the specified filter and stores it 
    async get(filter: {[key: string]: any} = {}): Promise<MongoModel> {
        return get.call(this, filter);
    }

    // Saves current model data into the db
    async save(insertIfNotExists: boolean = false): Promise<MongoModel> {
        return save.call(this, insertIfNotExists);
    }

    // Deletes current item from db
    async delete(): Promise<MongoModel> {
        return deleteMethod.call(this);
    }
}   

export default MongoModel;
