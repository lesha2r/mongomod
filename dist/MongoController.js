import { MmControllerError } from './errors/controllerError.js';
import { validateControllerCollection, validateControllerDb } from './utils/controller.js';
import count from './methods/count.js';
import distinct from './methods/distinct.js';
import bulkWrite from './methods/bulkWrite.js';
import findOneMethod from './methods/findOne.js';
import aggregateMethod from './methods/aggregate.js';
import findManyMethod from './methods/findMany.js';
import deleteManyMethod from './methods/deleteMany.js';
import insertOneMethod from './methods/insertOne.js';
import updateOneMethod from './methods/updateOne.js';
import deleteOneMethod from './methods/deleteOne.js';
import ensureIndex from './methods/ensureIndex.js';
import updateManyMethod from './methods/updateMany.js';
import insertManyMethod from './methods/insertMany.js';
import { ControllerErrCodes, ControllerErrMsgs } from './constants/controller.js';
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
                code: ControllerErrCodes.NotConnected,
                message: ControllerErrMsgs.NotConnected,
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
