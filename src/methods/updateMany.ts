import MongoController from "../MongoController.js"
import { MethodResult } from "../types/methods.js"

export type MethodUpdateManyOptions = {
    query: {[key: string]: any}
    data: {[key: string]: any}
    upsert?: boolean
    unset?: boolean
}

// Updates many documents matching the query
export default function updateMany(this: MongoController, options: MethodUpdateManyOptions): Promise<MethodResult>  {
    return new Promise(async (resolve, reject) => {
        try {
            let { query, data, upsert, unset } = options;
            
            const collection = this.collection;

            const client = this.getClient()
            const db = client.db(this.db.dbName);
            const col = db.collection(collection);
        
            // Checks, validations
            if (!collection) throw new Error('no collection specified');
            let upsertParam = (!upsert) ? { upsert: false } : { upsert: upsert };
            if (!query) query = {};

            type TUpdateManySet = {$unset: {}}|{$set: {}}

            const setDefault: TUpdateManySet = (unset === true) ? { $unset: data } : { $set: data};
            let setRe: TUpdateManySet | {[key: string]: any} = {}

            // In case if 'set' operator is not needed
            if (data.$addToSet) setRe = data;
            else if (data.$pull) setRe = data;
            else if (data.$inc) setRe = data;
            else setRe = setDefault

            const result = await col.updateMany(
                query,
                setRe,
                upsertParam
            );
            
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