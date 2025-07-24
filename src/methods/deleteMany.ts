import MongoController from "../MongoController.js";

export type MethodDeleteOptions = {
    query: {[key: string]: any}
}

// Deletes all documents matching the query
export default function deleteMany(this: MongoController, options: MethodDeleteOptions) {
    return new Promise(async (resolve, reject) => {
        try {
            let { query } = options;
            const collection = this.collection;
            const client = this.getClient()

            if (!collection) throw new Error('no collection specified');

            const db = client.db(this.db.dbName);
            const col = db.collection(collection);

            if (!query) query = {};

            const result = await col.deleteMany(
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