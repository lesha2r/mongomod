import { ObjectId } from 'mongodb';
import { MethodResult } from '../types/methods.js';
import MongoController from '../MongoController.js';

export type MethodFindOneOptions = {
    query: {[key: string]: any}
    limit?: number
    skip?: number
}

// Finds one document matching the query
export default function findOne(this: MongoController, options: MethodFindOneOptions): Promise<MethodResult> {
    return new Promise(async (resolve, reject) => {
        try {
            let { query } = options;
    
            // Check and validate
            if (!query) throw new Error('no query specified');

            // Convert _id to ObjectId if parameter exists
            if (query._id) query._id = new ObjectId(query._id);

            const client = this.getClient()
            const db = client.db(this.db.dbName);
            const col = db.collection(this.collection);

            const result = await col.findOne(query);

            if (!result || result == null) {
                resolve({ ok: true, details: 'nothing found', result: {} });
            }

            if (result) resolve({ ok: true, result: result });
        } catch (err) {
            if (err) reject({ ok: false, details: 'error catched', error: err });
        }
    });
};