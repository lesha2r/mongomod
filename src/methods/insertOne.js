import { ObjectId } from 'mongodb';

/**
 * Inserts a document into a database
 * @param { Object } options extra options object
 * @returns { Promise } Promise
 */
export default function insertOne(options) {
    return new Promise(async (resolve, reject) => {
        try {
            let { data } = options;
            let collection = this.collection;

            // Checks, validations
            if (!collection) throw new Error('no collection specified');

            if (!data || Object.keys(data).length === 0) {
                throw new Error('options.data cannot be empty');
            }

            const db = this.getClient().db(this.dbName);
            const col = db.collection(collection);

            let result = await col.insertOne(data);
            
            if (result && result.acknowledged === true) {
                resolve({ ok: true, details: result });
            }
        } catch (err) {
            if (err.code === 11000) {
                reject({ ok: false, details: 'duplicate', error: err });
            } else if (err.code === 121) {
                reject({ ok: false, details: 'validation failed', error: err });
            } else {
                resolve({ ok: false, details: 'error catched', error: err });
            }
        }
    });
};