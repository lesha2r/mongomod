import MongoController from '../MongoController.js';
import { TMethodResult } from '../types/methods.js';

export type TBulkWriteInput = {}[]

export default function bulkWrite(this: MongoController, operations: TBulkWriteInput): Promise<TMethodResult> {
    return new Promise(async (resolve, reject) => {
        try {
            if (Array.isArray(operations) !== true) {
                throw new Error('operations argument must be an array');
            }
            
            const collection = this.collection;

            const client = this.getClient()
            if (!client) throw new Error('client is null')

            const db = client.db(this.db.dbName);
            const col = db.collection(collection);
            
            if (!collection) throw new Error('no collection specified');

            // @ts-ignore
            const result = await col.bulkWrite(operations);
            
            resolve({
                ok: true,
                result: result
            });
        } catch (err) {
            reject({
                ok: false,
                details: 'error catched',
                error: err
            });
        }
    });
};