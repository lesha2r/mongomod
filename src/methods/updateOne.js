import { ObjectId } from 'mongodb';

/**
 * Updates one document matching the query
 * @param { object } options
 * @returns { Promise } Promise
 */
export default function updateOne(options) {
    return new Promise(async (resolve, reject) => {
        let { 
            query,
            data,
            upsert,
            unset
        } = options;

        let collection = this.collection;

        // Check, validate, prepare data
        if (!collection) throw new Error('no collection specified');
        if (!query) query = {};
        if (query._id) query._id = ObjectId(query._id);

        if (!data && Object.keys(data).length === 0) throw new Error('missing data object');

        let upsertParam = (!upsert) ? { upsert: false } : { upsert: upsert };
        let set = (unset === true) ? { $unset: data } : { $set: data};

        // In case if 'set' operator is not needed
        if (data.$addToSet) set = data;
        else if (data.$pull) set = data;
        else if (data.$inc) set = data;
        
        try {
            const db = this.getClient().db(this.dbName);
            const col = db.collection(collection);
            
            let result = await col.findOneAndUpdate(query, set, upsertParam);

            if (!result || result.ok !== 1) {
                reject({ ok: false, details: 'document not found or something went wrong' });
                return;
            }

            if (result) resolve({
                ok: true,
                result: result
            });
        } catch (err) {
            if (err.code === 121) {
                reject({ ok: false, details: 'validation failed', error: err });
            } else {
                reject({ ok: false, details: 'error catched', error: err });
            }
        }
    });
};