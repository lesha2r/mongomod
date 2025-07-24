import MongoController from "../MongoController.js";
import { AggregationStage } from "../types/aggregationStages.js";
import type { MethodResult } from "../types/methods.js";

export type AggregationQuery = AggregationStage[]

export default function aggregate(this: MongoController, query: AggregationQuery): Promise<MethodResult> {
    return new Promise(async (resolve, reject) => {
        try {
            const collection = this.collection;

            const client = this.getClient()
            const db = client.db(this.db.dbName);
            const col = db.collection(collection);
            
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