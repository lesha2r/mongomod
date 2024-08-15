import MongoController from "../MongoController.js";
import type { TMethodResult } from "../types/methods.js";

export type TAggregationQuery = {}[]

export default function aggregate(this: MongoController, query: TAggregationQuery): Promise<TMethodResult> {
    return new Promise(async (resolve, reject) => {
        try {
            const collection = this.collection;

            const client = this.getClient()
            if (!client) throw new Error('client is null')

            const db = client.db(this.db.dbName);
            const col = db.collection(collection);
            
            // Checks, validations
            if (!collection) throw new Error('no collection specified');

            const result = await col.aggregate(query).toArray();
            
            resolve({
                ok: true,
                result: result
            });
        } catch (err) {
            reject({
                ok: false,
                details: 'error catched',
                error: err
            });
        }
    });
};