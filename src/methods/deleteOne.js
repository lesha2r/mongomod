import { ObjectId } from 'mongodb';

/**
 * Deletes one document mathcing the query
 * @param { Object } options extra options object
 * @returns { Promise } Promise
 */
export default function deleteOne(options) {
    return new Promise(async (resolve, reject) => {
        try {
            let { query } = options;
            let collection = this.collection;

            // Checks, validations
            if (!collection) throw new Error('no collection specified');
            if (!query || Object.keys(query).length === 0) {
                throw new Error('no query specified');
            }

            const db = this.getClient().db(this.dbName);
            const col = db.collection(collection);

            let result = await col.findOneAndDelete(query);
            
            if (result.ok === 1 && result.value === null) {
                resolve({ ok: true, details: 'done but seems like there was no such item' });
                return;
            } else if (result.ok === 1 && result.value) {
                resolve({ ok: true, details: 'done', result: result });
                return;
            } else {
                throw new Error('unknown result that wasn\'t handled');
            }
        } catch (err) {
            resolve({ ok: false, details: 'error catched', error: err });
        }
    });
};