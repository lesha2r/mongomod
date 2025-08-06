import _ from 'lodash';
import MongoController from "./MongoController/index.js";
import { ModelErrCodes, ModelErrMsgs } from './constants/model.js';
import { MmValidationError, MmOperationError } from './errors/index.js';
import { MongomodErrCodes, MongomodErrMsgs } from './constants/mongomod.js';
import { filterObject } from './utils/index.js';
import { ObjectId } from 'mongodb';
const throwCustomMethodError = (methodName) => {
    throw new MmValidationError({
        code: MongomodErrCodes.CustomMethodNotFunction,
        message: `${MongomodErrMsgs.CustomMethodNotFunction}: ${methodName}`,
    });
};
const throwCustomMethodErrorIfNeeded = (failedMethods) => {
    if (failedMethods.length > 0)
        return;
    throwCustomMethodError(failedMethods.join(', '));
};
function parseCustomMethods(customMethods) {
    const failedMethods = [];
    for (let [key, value] of Object.entries(customMethods || {})) {
        if (typeof value === 'function') {
            this[key] = value.bind(this);
        }
        else {
            failedMethods.push(key);
        }
    }
    throwCustomMethodErrorIfNeeded(failedMethods);
}
class MongoModel extends MongoController {
    db;
    schema;
    collection;
    modelData;
    constructor(inputOptions) {
        const { db, collection, schema = null, customs = {} } = inputOptions;
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
    static findOne(options) {
        return this.findOne(options);
    }
    static findMany(options) {
        return this.findMany(options);
    }
    static insertOne(options) {
        return this.insertOne(options);
    }
    static updateOne(options) {
        return this.updateOne(options);
    }
    static deleteOne(options) {
        return this.deleteOne(options);
    }
    static updateMany(options) {
        return this.updateMany(options);
    }
    static deleteMany(options) {
        return this.deleteMany(options);
    }
    static insertMany(options) {
        return this.insertMany(options);
    }
    static aggregate(options) {
        return this.aggregate(options);
    }
    static count(options) {
        return this.count(options);
    }
    static bulkWrite(options) {
        return this.bulkWrite(options);
    }
    static distinct(options) {
        return this.distinct(options);
    }
    ensureModelData() {
        if (this.modelData)
            return true;
        throw new MmOperationError({
            code: ModelErrCodes.ModelDataEmpty,
            message: ModelErrMsgs.ModelDataEmpty,
            dbName: this.db.dbName,
            operation: 'ensureModelData'
        });
    }
    ensureModelId() {
        this.ensureModelData();
        if (this.modelData && this.modelData._id)
            return true;
        throw new MmOperationError({
            code: ModelErrCodes.MissingId,
            message: ModelErrMsgs.MissingId,
            dbName: this.db.dbName,
            operation: 'ensureModelId'
        });
    }
    dataFiltered(allowedKeys) {
        if (!this.modelData)
            return null;
        return filterObject(this.modelData, allowedKeys);
    }
    toString() {
        if (!this.modelData)
            return "";
        return JSON.stringify(this.modelData);
    }
    validate(data = this.modelData) {
        if (!this.schema)
            return null;
        const validationResult = this.schema.validate(data);
        if (validationResult.ok === false) {
            throw new MmValidationError({
                code: ModelErrCodes.InvalidModelData,
                message: `${ModelErrMsgs.InvalidModelData}: ${validationResult.failed.join(', ')}`,
                dbName: this.db.dbName || null
            });
        }
        return validationResult;
    }
    clearBySchema() {
        if (!this.schema)
            return this;
        const schema = this.schema.schema;
        if (Object.keys(schema).length === 0)
            return this;
        if (!this.modelData)
            return this;
        const currentModelData = _.cloneDeep(this.modelData);
        let newModelData = {};
        const _id = currentModelData._id instanceof ObjectId ? currentModelData._id : new ObjectId(currentModelData._id);
        for (let key in currentModelData) {
            if (key in schema === false)
                delete currentModelData[key];
        }
        this.modelData = newModelData;
        if (_id)
            this.modelData._id = _id;
        return this;
    }
    init(data) {
        this.validate(data);
        this.modelData = data;
        return this;
    }
    set(data) {
        if (!this.modelData)
            this.modelData = {};
        const updatedModelData = { ...this.modelData, ...data };
        this.validate(updatedModelData);
        this.modelData = updatedModelData;
        return this;
    }
    async insert() {
        this.ensureModelData();
        try {
            const result = await this.insertOne({ data: this.modelData });
            if (!result.ok) {
                throw new MmOperationError({
                    code: ModelErrCodes.InsertFailed,
                    message: ModelErrMsgs.InsertFailed,
                    dbName: this.db.dbName,
                    operation: 'insert'
                });
            }
            if (result.data && 'insertedId' in result.data) {
                this.modelData._id = result.data.insertedId;
            }
            return this;
        }
        catch (err) {
            if (err instanceof MmOperationError || err instanceof MmValidationError) {
                throw err;
            }
            throw new MmOperationError({
                code: ModelErrCodes.SaveFailed,
                message: `Failed to insert model to database: ${err instanceof Error ? err.message : 'Unknown error'}`,
                dbName: this.db.dbName,
                operation: 'insert'
            });
        }
    }
    async get(filter = {}) {
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
        }
        catch (err) {
            if (err instanceof MmOperationError || err instanceof MmValidationError) {
                throw err;
            }
            throw new MmOperationError({
                code: ModelErrCodes.GetFailed,
                message: `${ModelErrMsgs.GetFailed}: ${err instanceof Error ? err.message : 'Unknown error'}`,
                dbName: this.db.dbName,
                operation: 'get'
            });
        }
    }
    async save(insertIfNotExists = false) {
        this.ensureModelData();
        try {
            if (insertIfNotExists === true) {
                await this.insert();
            }
            else {
                this.ensureModelId();
                const result = await this.updateOne({
                    filter: { _id: this.modelData._id },
                    update: this.modelData
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
        }
        catch (err) {
            if (err instanceof MmOperationError || err instanceof MmValidationError) {
                throw err;
            }
            throw new MmOperationError({
                code: ModelErrCodes.SaveFailed,
                message: `${ModelErrMsgs.SaveFailed}: ${err instanceof Error ? err.message : 'Unknown error'}`,
                dbName: this.db.dbName,
                operation: 'save'
            });
        }
    }
    async delete() {
        this.ensureModelId();
        try {
            const filter = { _id: this.modelData._id };
            const result = await this.deleteOne({ filter });
            if (!result.ok) {
                throw new MmOperationError({
                    code: ModelErrCodes.DeleteFailed,
                    message: ModelErrMsgs.DeleteFailed,
                    dbName: this.db.dbName,
                    operation: 'delete'
                });
            }
            this.modelData = null;
            return this;
        }
        catch (err) {
            if (err instanceof MmOperationError)
                throw err;
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
