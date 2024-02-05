import { ObjectId } from 'mongodb';

/**
* Counts documents matching the query
* @param { Object } options extra options object
* @returns { Promise } Promise
*/
export default function count(options = {}) {
    return new Promise(async (resolve, reject) => {
        try {
            let { query } = options;
            let collection = this.collection;

            // Checks, validations
            if (!collection) throw new Error('no collection specified');
            if (!query) query = {};
                
            const db = this.getClient().db(this.dbName);
            const col = db.collection(collection);

            let result = await col.countDocuments(query);
            
            resolve({ ok: true, result: result });
        } catch (err) {
            reject({ ok: false, details: 'error catched', error: err});
        }
    });
}