import MongoController from '../MongoController.js';
import { TMethodResult } from '../types/methods.js';

export type TInsertOneInput = {
    data: {[key: string]: any}
}

// Inserts a document into a database
export default function insertOne(this: MongoController, options: TInsertOneInput): Promise<TMethodResult> {
    return new Promise(async (resolve, reject) => {
        try {
            const { data } = options;
            const collection = this.collection;

            // Checks, validations
            if (!collection) throw new Error('no collection specified');

            if (!data || Object.keys(data).length === 0) {
                throw new Error('options.data cannot be empty');
            }

            const client = this.getClient()
            if (!client) throw new Error('client is null')

            const db = client.db(this.db.dbName);
            const col = db.collection(collection);

            const result = await col.insertOne(data);
            
            if (result && result.acknowledged === true) {
                resolve({ ok: true, result: result });
            }
        } catch (err) {
            // @ts-ignore
            if (err.code === 11000) {
                reject({ ok: false, details: 'duplicate', error: err });
            // @ts-ignore
            } else if (err.code === 121) {
                reject({ ok: false, details: 'validation failed', error: err });
            } else {
                // @ts-ignore
                resolve({ ok: false, details: 'error catched', error: err });
            }
        }
    });
};