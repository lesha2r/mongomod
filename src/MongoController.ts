import MongoConnection from './MongoConnection.js';
import { MmControllerError } from './errors/controllerError.js';
import { validateControllerCollection, validateControllerDb } from './utils/controller.js';
// Methods
import count, { MethodCountOptions } from './methods/count.js';
import distinct, { MethodDistinctOptions } from './methods/distinct.js';
import bulkWrite, { MethodBulkWriteOptions } from './methods/bulkWrite.js';
import findOneMethod, { MethodFindOneOptions } from './methods/findOne.js';
import aggregateMethod, { AggregationPipeline } from './methods/aggregate.js';
import findManyMethod, { MethodFindManyOptions } from './methods/findMany.js';
import deleteManyMethod, { MethodDeleteOptions } from './methods/deleteMany.js';
import insertOneMethod, { MethodInsertOneOptions } from './methods/insertOne.js';
import updateOneMethod, { MethodUpdateOneOptions } from './methods/updateOne.js';
import deleteOneMethod, { MethodDeleteOneOptions } from './methods/deleteOne.js';
import ensureIndex, { MethodEnsureIndexOptions } from './methods/ensureIndex.js';
import updateManyMethod, { MethodUpdateManyOptions } from './methods/updateMany.js';
import insertManyMethod, { MethodInsertManyOptions } from './methods/insertMany.js';
import { ControllerErrCodes, ControllerErrMsgs } from './constants/controller.js';

class MongoController {
    db: MongoConnection
    collection: string

    constructor (db: MongoConnection, collection: string) {
        validateControllerDb(db);
        validateControllerCollection(db, collection)

        this.db = db;
        this.collection = collection
    }

    // Returns database client object
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

    // Finds one document matching the query
    findOne(options: MethodFindOneOptions) {
        return findOneMethod.call(this, options);
    }
    
    // Finds many documents matching the query
    findMany(options: MethodFindManyOptions) {
        return findManyMethod.call(this, options);
    };

    // Inserts a document into a database
    insertOne(options: MethodInsertOneOptions) {
        return insertOneMethod.call(this, options);
    };
    
    // Updates one document matching the query
    updateOne(options: MethodUpdateOneOptions) {
        return updateOneMethod.call(this, options);
    };
    
    // Deletes one document mathcing the query
    deleteOne(options: MethodDeleteOneOptions) {
        return deleteOneMethod.call(this, options);
    };

    // Updates many documents matching the query
    updateMany(options: MethodUpdateManyOptions)  {
        return updateManyMethod.call(this, options);
    };
    
    // Deletes all documents matching the query
    deleteMany(options: MethodDeleteOptions) {
        return deleteManyMethod.call(this, options);
    };
    
    // Inserts many documents into the database
    insertMany(options: MethodInsertManyOptions) {
        return insertManyMethod.call(this, options);
    };
    
    // Returns aggregation pipeline result
    aggregate(pipeline: AggregationPipeline) {
        return aggregateMethod.call(this, pipeline);
    };
    
    // Counts documents matching the query
    count(options: MethodCountOptions) {
        return count.call(this, options);
    }

    // Returns unique document fields matching the query
    distinct(options: MethodDistinctOptions) {
        return distinct.call(this, options);
    }

    // Sends bulk write operations
    bulkWrite(operations: MethodBulkWriteOptions = []) {
        return bulkWrite.call(this, operations);
    }

    // Checks that index for required keys exists
    ensureIndex(checkKeys: MethodEnsureIndexOptions) {
        return ensureIndex.call(this, checkKeys)
    }
}

export default MongoController;