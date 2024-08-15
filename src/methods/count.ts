import { ObjectId } from 'mongodb';
import MongoController from '../MongoController.js';

export type TCountInput = {
    query?: {[key: string]: any},
}

// Counts documents matching the query
export default function count(this: MongoController, options: TCountInput = {}) {
    return new Promise(async (resolve, reject) => {
        try {
            let { query } = options;
            const collection = this.collection;
            const client = this.getClient()
            
            if (!collection) throw new Error('no collection specified');
            if (!client) throw new Error('client is null')
            
            if (!query) query = {};

            const db = client.db(this.db.dbName);
            const col = db.collection(collection);

            const result = await col.countDocuments(query);
            
            resolve({ ok: true, result: result });
        } catch (err) {
            reject({ ok: false, details: 'error catched', error: err});
        }
    });
}