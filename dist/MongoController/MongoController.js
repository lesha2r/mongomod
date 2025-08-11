import { MmControllerError } from '../errors/controllerError.js';
import { validateControllerCollection, validateControllerDb } from '../utils/controller.js';
import count from './operations/count.js';
import distinct from './operations/distinct.js';
import bulkWrite from './operations/bulkWrite.js';
import findOneMethod from './operations/findOne.js';
import aggregateMethod from './operations/aggregate.js';
import findManyMethod from './operations/findMany.js';
import deleteManyMethod from './operations/deleteMany.js';
import insertOneMethod from './operations/insertOne.js';
import updateOneMethod from './operations/updateOne.js';
import deleteOneMethod from './operations/deleteOne.js';
import ensureIndex from './operations/ensureIndex.js';
import updateManyMethod from './operations/updateMany.js';
import insertManyMethod from './operations/insertMany.js';
import { MmControllerErrors } from '../constants/controller.js';
class MongoController {
    db;
    collection;
    constructor(db, collection) {
        validateControllerDb(db);
        validateControllerCollection(db, collection);
        this.db = db;
        this.collection = collection;
    }
    getClient() {
        if (!this.db || !this.db.client) {
            throw new MmControllerError({
                code: MmControllerErrors.NotConnected.code,
                message: MmControllerErrors.NotConnected.message,
                dbName: this.db?.dbName || null
            });
        }
        return this.db.client;
    }
    getCollectionCtrl() {
        const client = this.getClient();
        const db = client.db(this.db.dbName);
        const collection = db.collection(this.collection);
        return collection;
    }
    findOne(options) {
        return findOneMethod.call(this, options);
    }
    findMany(options) {
        return findManyMethod.call(this, options);
    }
    ;
    insertOne(options) {
        return insertOneMethod.call(this, options);
    }
    ;
    updateOne(options) {
        return updateOneMethod.call(this, options);
    }
    ;
    deleteOne(options) {
        return deleteOneMethod.call(this, options);
    }
    ;
    updateMany(options) {
        return updateManyMethod.call(this, options);
    }
    ;
    deleteMany(options) {
        return deleteManyMethod.call(this, options);
    }
    ;
    insertMany(options) {
        return insertManyMethod.call(this, options);
    }
    ;
    aggregate(pipeline) {
        return aggregateMethod.call(this, pipeline);
    }
    ;
    count(options) {
        return count.call(this, options);
    }
    distinct(options) {
        return distinct.call(this, options);
    }
    bulkWrite(operations = []) {
        return bulkWrite.call(this, operations);
    }
    ensureIndex(checkKeys) {
        return ensureIndex.call(this, checkKeys);
    }
}
export default MongoController;
