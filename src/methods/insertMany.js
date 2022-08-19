import { ObjectId } from 'mongodb';

/**
 * Inserts many documents into the database
 * @param { Object } options extra options object
 * @returns { Promise } Promise
 */
export default function insertMany(options) {
    return new Promise(async (resolve, reject) => {
        try {
            let { data, ordered } = options;
            
            let collection = this.collection;

            const db = this.getClient().db(this.dbName);
            const col = db.collection(collection);
            
            // Checks, validations
            if (!collection) throw new Error('no collection specified');
            if (!data || !Array.isArray(data)) {
                throw new Error('check data format');
            }

            if (!ordered) ordered = false;

            let result = await col.insertMany(data, { ordered });
            
            resolve({
                ok: true,
                result: result
            });

        } catch (err) {
            reject({ ok: false, details: 'error catched', error: err });
        }
    });
};