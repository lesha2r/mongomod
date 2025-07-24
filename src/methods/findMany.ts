import { ObjectId } from 'mongodb';
import { MethodResult } from '../types/methods.js';
import MongoController from '../MongoController.js';

export type MethodFindManyOptions = {
    query: {[key: string]: any}
    limit?: number
    skip?: number
}

// Finds many documents matching the query
export default function findMany(this: MongoController, options: MethodFindManyOptions): Promise<MethodResult> {
    return new Promise(async (resolve, reject) => {
        try {
            let { query, limit, skip } = options;
            const collection = this.collection;

            // Check and validate
            if (!collection) throw new Error('no collection specified');

            if (!query) query = {};
            if (!limit) limit = 99999999;
            if (!skip) skip = 0;

            if (query._id) query._id = new ObjectId(query._id);

            const client = this.getClient()

            const db = client.db(this.db.dbName);
            const col = db.collection(collection);

            const result = await col.find(query).limit(limit).skip(skip).toArray();

            if (!result || Array.isArray(result) && result.length === 0) {
                resolve({ ok: true, details: 'nothing found', result: [] });
                return;
            }
            
            if (result) resolve({ ok: true, result: result });
        } catch (err) {
            if (err) reject({ ok: false, details: 'error catched', error: err });
        }
    });
};