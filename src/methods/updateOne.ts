import { ObjectId } from 'mongodb';
import { MethodResult } from '../types/methods.js';
import MongoController from '../MongoController.js';

export type MethodUpdateOneOptions = {
    query: {[key: string]: any}
    data: {[key: string]: any}
    upsert?: boolean
    unset?: boolean
}

// Updates one document matching the query
export default function updateOne(this: MongoController, options: MethodUpdateOneOptions): Promise<MethodResult> {
    return new Promise(async (resolve, reject) => {
        let { 
            query,
            data,
            upsert,
            unset
        } = options;

        const collection = this.collection;

        // Check, validate, prepare data
        if (!collection) throw new Error('no collection specified');
        if (!query) query = {};
        if (query._id) query._id = new ObjectId(query._id);

        if (!data && Object.keys(data).length === 0) throw new Error('missing data object');

        const upsertParam = (!upsert) ? { upsert: false } : { upsert: upsert };

        type TUpdateManySet = {$unset: {}}|{$set: {}}
        const setDefault: TUpdateManySet = (unset === true) ? { $unset: data } : { $set: data};
        let setRe: TUpdateManySet | {[key: string]: any} = {}

        if (data.$addToSet) setRe = data;
        else if (data.$pull) setRe = data;
        else if (data.$inc) setRe = data;
        else setRe = setDefault
        
        try {
            const client = this.getClient()
            const db = client.db(this.db.dbName);
            const col = db.collection(collection);
            
            const result = await col.findOneAndUpdate(query, setRe, upsertParam);

            if (!result || result.ok !== 1) {
                reject({ ok: false, details: 'document not found or something went wrong' });
                return;
            } else if (result) {
                resolve({
                    ok: true,
                    result: result
                });
            }
        } catch (err) {
            // @ts-ignore
            if (err.code === 121) {
                reject({ ok: false, details: 'validation failed', error: err });
            } else {
                reject({ ok: false, details: 'error catched', error: err });
            }
        }
    });
};