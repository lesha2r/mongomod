import { ObjectId } from 'mongodb';

/**
 * Updates many documents matching the query
 * @param { Object } options extra options object
 * @returns { Promise } Promise
 */
export default function updateMany(options)  {
    return new Promise(async (resolve, reject) => {
        try {
            let { query, data, upsert, unset } = options;
            
            let collection = this.collection;

            const db = this.getClient().db(this.dbName);
            const col = db.collection(collection);
        
            // Checks, validations
            if (!collection) throw new Error('no collection specified');
            let upsertParam = (!upsert) ? { upsert: false } : { upsert: upsert };
            if (!query) query = {};

            let set = (unset === true) ? { $unset: data } : { $set: data};

            // In case if 'set' operator is not needed
            if (data.$addToSet) set = data;
            else if (data.$pull) set = data;
            else if (data.$inc) set = data;

            const result = await col.updateMany(
                query,
                set,
                upsertParam
            );
            
            resolve({
                ok: true,
                result: result
            });
        } catch (err) {
            reject({ ok: false, details: 'error catched', error: err });
        }
    });
};