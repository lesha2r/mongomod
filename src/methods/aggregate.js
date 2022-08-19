import { ObjectId } from 'mongodb';

/**
 * Returns aggregation pipeline result
 * @param { Object } query aggregation object
 * @returns { Promise } Promise
 */
export default function aggregate(query) {
    return new Promise(async (resolve, reject) => {
        try {
            let collection = this.collection;

            const db = this.getClient().db(this.dbName);
            const col = db.collection(collection);
            
            // Checks, validations
            if (!collection) throw new Error('no collection specified');

            let result = await col.aggregate(query).toArray();
            
            resolve({
                ok: true,
                result: result
            });

        } catch (err) {
            reject({ ok: false, details: 'error catched', error: err });
        }
    });
};