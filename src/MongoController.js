'use strict';

import { ObjectId } from 'mongodb';
import findOneMethod from './methods/findOne.js';
import findManyMethod from './methods/findMany.js';
import insertOneMethod from './methods/insertOne.js';
import updateOneMethod from './methods/updateOne.js';
import deleteOneMethod from './methods/deleteOne.js';
import updateManyMethod from './methods/updateMany.js';
import deleteManyMethod from './methods/deleteMany.js';
import insertManyMethod from './methods/insertMany.js';
import aggregateMethod from './methods/aggregate.js';
import count from './methods/count.js';
import distinct from './methods/distinct.js';
import bulkWrite from './methods/bulkWrite.js';

class MongoController {
    constructor (db, collection) {
        this.db = db;
        if (collection && typeof collection === 'string') this.collection = collection;
    }

    /**
     * Returns database client object
     * @returns db.client
     */
    getClient() {
        return this.db.client;
    }

    /**
     * Finds one document matching the query
     * @param { Object } options extra options object
     * @returns { Promise } Promise
     */
    findOne(options) {
        return findOneMethod.call(this, options);
    }
    
    /**
     * Finds many documents matching the query
     * @param { Object } options extra options object
     * @returns { Promise } Promise
     */
    findMany(options) {
        return findManyMethod.call(this, options);
    };

    /**
     * Inserts a document into a database
     * @param { Object } options extra options object
     * @returns { Promise } Promise
     */
    insertOne(options) {
        return insertOneMethod.call(this, options);
    };
    
    /**
     * Updates one document matching the query
     * @param { object } options
     * @returns { Promise } Promise
     */
    updateOne(options) {
        return updateOneMethod.call(this, options);
    };
    
    /**
     * Deletes one document mathcing the query
     * @param { Object } options extra options object
     * @returns { Promise } Promise
     */
    deleteOne(options) {
        return deleteOneMethod.call(this, options);
    };

    /**
     * Updates many documents matching the query
     * @param { Object } options extra options object
     * @returns { Promise } Promise
     */
    updateMany(options)  {
        return updateManyMethod.call(this, options);
    };
    
    /**
     * Deletes all documents matching the query
     * @param { Object } options extra options object
     * @returns { Promise } Promise
     */
    deleteMany(options) {
        return deleteManyMethod.call(this, options);
    };
    
    /**
     * Inserts many documents into the database
     * @param { Object } options extra options object
     * @returns { Promise } Promise
     */
    insertMany(options) {
        return insertManyMethod.call(this, options);
    };
    
    /**
     * Returns aggregation pipeline result
     * @param { Object } query aggregation object
     * @returns { Promise } Promise
     */
    aggregate(query) {
        return aggregateMethod.call(this, query);
    };
    
    /**
    * Counts documents matching the query
    * @param { Object } options extra options object
    * @returns { Promise } Promise
    */
    count(options = {}) {
        return count.call(this, options);
    }

    /**
    * Returns unique document fields matching the query
    * @param { Object } options extra options object
    * @returns { Promise } Promise
    */
    distinct(options = {}) {
        return distinct.call(this, options);
    }

    /**
    * Sends bulk write operations
    * @param { Array } operations list of operations to be done
    * @returns { Promise } Promise
    */
    bulkWrite(operations = []) {
        return bulkWrite.call(this, operations);
    }

}

export default MongoController;