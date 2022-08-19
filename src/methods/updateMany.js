import { ObjectId } from 'mongodb';

/**
 * Updates many documents matching the query
 * @param { Object } options extra options object
 * @returns { Promise } Promise
 */
export default function updateMany(options)  {
    return new Promise(async (resolve, reject) => {
        try {
            let { query, data, upsert } = options;
            
            let collection = this.collection;

            const db = this.getClient().db(this.dbName);
            const col = db.collection(collection);
            
            // Checks, validations
            if (!collection) throw new Error('no collection specified');
            if (!upsert) upsert = true;
            if (!query) query = {};

            let result = await col.updateMany(
                query,
                { $set: data },
                { upsert: upsert }
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