import { ObjectId } from 'mongodb';

/**
 * Finds one document matching the query
 * @param { Object } options extra options object
 * @returns { Promise } Promise
 */
export default function findOne(options) {
    let { query } = options;
    
    // Check and validate
    if (!query) throw new Error('no query specified');

    return new Promise(async (resolve, reject) => {
        try {
            // Convert _id to ObjectId if parameter exists
            if (query._id) query._id = ObjectId(query._id);

            // Query
            const db = this.getClient().db(this.dbName);
            const col = db.collection(this.collection);

            let result = await col.findOne(query);

            if (!result || result == null) {
                resolve({ ok: true, details: 'nothing found', result: null });
            }

            if (result) resolve({ ok: true, result: result });
        } catch (err) {
            if (err) reject({ ok: false, details: 'error catched', error: err });
        }
    });
};