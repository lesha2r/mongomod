import { ObjectId } from 'mongodb';

/**
 * Finds many documents matching the query
 * @param { Object } options extra options object
 * @returns { Promise } Promise
 */
export default function findMany(options) {
    return new Promise(async (resolve, reject) => {
        try {
            let { query, limit, skip } = options;
            let collection = this.collection;

            // Check and validate
            if (!collection) throw new Error('no collection specified');
            if (!query) query = {};
            if (!limit) limit = 99999999;
            if (!skip) skip = 0;

            if (query._id) query._id = ObjectId(query._id);

            const db = this.getClient().db(this.dbName);
            const col = db.collection(collection);

            let result = await col.find(query).limit(limit).skip(skip).toArray();

            if (!result || Array.isArray(result) && result.length === 0) {
                resolve({ ok: true, details: 'nothing found', result: [] });
                return;
            }
            
            if (result) resolve({ ok: true, result: result });
        } catch (err) {
            if (err) reject({ ok: false, details: 'error catched', error: err });
        }
    });
};