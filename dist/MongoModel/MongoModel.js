import { filterObject } from '../utils/common.js';
import _constructorUtils from './utils/constructor.utils.js';
import MongoController from "../MongoController/index.js";
import { MmOperationError } from '../errors/index.js';
import clearBySchema from './methods/cleaBySchema.js';
import init from './methods/init.js';
import set from './methods/set.js';
import insert from './methods/insert.js';
import get from './methods/get.js';
import save from './methods/save.js';
import deleteMethod from './methods/delete.js';
import validate from './methods/validate.js';
import { MmModelErrors } from '../constants/model.js';
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
};
class MongoModel extends MongoController {
    db;
    schema;
    collection;
    modelData;
    constructor(inputOptions) {
        const { db, collection, schema = null, customs } = inputOptions;
        super(db, collection);
        this.collection = collection;
        this.schema = schema;
        this.db = db;
        this.modelData = null;
        _constructorUtils.parseCustomMethods.call(this, customs);
    }
    _modelDataBeforeSave = null;
    ensureModelData() {
        if (this.modelData)
            return true;
        throw new MmOperationError({
            code: MmModelErrors.ModelDataEmpty.code,
            message: MmModelErrors.ModelDataEmpty.message,
            dbName: this.db.dbName,
            operation: 'ensureModelData'
        });
    }
    ensureModelId() {
        this.ensureModelData();
        if (this.modelData && this.modelData._id)
            return true;
        throw new MmOperationError({
            code: MmModelErrors.MissingId.code,
            message: MmModelErrors.MissingId.message,
            dbName: this.db.dbName,
            operation: 'ensureModelId'
        });
    }
    data(clone = false) {
        if (!this.modelData)
            return null;
        if (clone)
            return JSON.parse(JSON.stringify(this.modelData));
        return this.modelData;
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
        return validate.call(this, data);
    }
    init(data) {
        return init.call(this, data);
    }
    clearBySchema() {
        return clearBySchema.call(this);
    }
    set(data) {
        return set.call(this, data);
    }
    async insert() {
        return insert.call(this);
    }
    async get(filter = {}) {
        return get.call(this, filter);
    }
    async save(insertIfNotExists = false) {
        return save.call(this, insertIfNotExists);
    }
    async delete() {
        return deleteMethod.call(this);
    }
}
export default MongoModel;
