'use strict';

import MongoConnection from './MongoConnection.js';

import count, { TCountInput } from './methods/count.js';
import distinct, { TDistinctInput } from './methods/distinct.js';
import bulkWrite, { TBulkWriteInput } from './methods/bulkWrite.js';
import findOneMethod, { TFindOneInput } from './methods/findOne.js';
import findManyMethod, { TFindManyInput } from './methods/findMany.js';
import insertOneMethod, { TInsertOneInput } from './methods/insertOne.js';
import updateOneMethod, { TUpdateOneInput } from './methods/updateOne.js';
import deleteOneMethod, { TDeleteOneInput } from './methods/deleteOne.js';
import ensureIndex, { TEnsureIndexInput } from './methods/ensureIndex.js';
import aggregateMethod, { TAggregationQuery } from './methods/aggregate.js';
import updateManyMethod, { TUpdateManyInput } from './methods/updateMany.js';
import deleteManyMethod, { TDeleteManyInput } from './methods/deleteMany.js';
import insertManyMethod, { TInsertManyInput } from './methods/insertMany.js';


class MongoController {
    db: MongoConnection
    collection: string

    constructor (db: MongoConnection, collection: string) {
        this.db = db;
        this.collection = (collection && typeof collection === 'string') ? collection : '';
    }

    // Returns database client object
    getClient() {
        return this.db.client;
    }

    // Finds one document matching the query
    findOne(options: TFindOneInput) {
        return findOneMethod.call(this, options);
    }
    
    // Finds many documents matching the query
    findMany(options: TFindManyInput) {
        return findManyMethod.call(this, options);
    };

    // Inserts a document into a database
    insertOne(options: TInsertOneInput) {
        return insertOneMethod.call(this, options);
    };
    
    // Updates one document matching the query
    updateOne(options: TUpdateOneInput) {
        return updateOneMethod.call(this, options);
    };
    
    // Deletes one document mathcing the query
    deleteOne(options: TDeleteOneInput) {
        return deleteOneMethod.call(this, options);
    };

    // Updates many documents matching the query
    updateMany(options: TUpdateManyInput)  {
        return updateManyMethod.call(this, options);
    };
    
    // Deletes all documents matching the query
    deleteMany(options: TDeleteManyInput) {
        return deleteManyMethod.call(this, options);
    };
    
    // Inserts many documents into the database
    insertMany(options: TInsertManyInput) {
        return insertManyMethod.call(this, options);
    };
    
    // Returns aggregation pipeline result
    aggregate(query: TAggregationQuery) {
        return aggregateMethod.call(this, query);
    };
    
    // Counts documents matching the query
    count(options: TCountInput = {}) {
        return count.call(this, options);
    }

    // Returns unique document fields matching the query
    distinct(options: TDistinctInput) {
        return distinct.call(this, options);
    }

    // Sends bulk write operations
    bulkWrite(operations: TBulkWriteInput = []) {
        return bulkWrite.call(this, operations);
    }

    // Checks that index for required keys exists
    ensureIndex(checkKeys: TEnsureIndexInput) {
        return ensureIndex.call(this, checkKeys)
    }
}

export default MongoController;