import { ObjectId } from 'mongodb';

/**
 * Deletes all documents matching the query
 * @param { Object } options extra options object
 * @returns { Promise } Promise
 */
export default function deleteMany(options) {
    return new Promise(async (resolve, reject) => {
        try {
            let { query, upsert } = options;
            
            let collection = this.collection;

            const db = this.getClient().db(this.dbName);
            const col = db.collection(collection);
            
            // Checks, validations
            if (!collection) throw new Error('no collection specified');
            if (!upsert) upsert = true;
            if (!query) query = {};

            let result = await col.deleteMany(
                query
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