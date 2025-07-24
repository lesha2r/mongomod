import { MethodResult } from '../types/methods.js';
import MongoController from '../MongoController.js';

export type MethodDistinctOptions = {
    field: string
    query: {[key: string]: any},
}

// Counts documents matching the query
export default function distinct(this: MongoController, options: MethodDistinctOptions): Promise<MethodResult> {
    return new Promise(async (resolve, reject) => {
        try {
            let { field, query  } = options;
            const collection = this.collection;

            // Checks, validations
            if (!field) throw new Error('no field specified');
            if (!collection) throw new Error('no collection specified');
            if (!query) query = {};
                
            const client = this.getClient()

            const db = client.db(this.db.dbName);
            const col = db.collection(collection);

            const result = await col.distinct(field, query);
            
            resolve({ ok: true, result: result });
        } catch (err) {
            reject({ ok: false, details: 'error catched', error: err});
        }
    });
}