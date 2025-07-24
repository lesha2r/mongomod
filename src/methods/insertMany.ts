import { MethodResult } from '../types/methods.js';
import MongoController from '../MongoController.js';

export type MethodInsertManyOptions = {
    data: {[key: string]: any}
    ordered?: boolean
}

// Inserts many documents into the database
export default function insertMany(this: MongoController, options: MethodInsertManyOptions): Promise<MethodResult> {
    return new Promise(async (resolve, reject) => {
        try {
            let { data, ordered } = options;
            
            const collection = this.collection;

            const client = this.getClient()
            const db = client.db(this.db.dbName);
            const col = db.collection(collection);
            
            // Checks, validations
            if (!collection) throw new Error('no collection specified');
            if (!data || !Array.isArray(data)) {
                throw new Error('check data format');
            }

            if (ordered !== false && !ordered) ordered = false;

            const result = await col.insertMany(data, { ordered });
            
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