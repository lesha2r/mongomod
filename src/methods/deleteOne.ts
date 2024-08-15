import MongoController from "../MongoController.js";
import { TMethodResult } from "../types/methods.js";

export type TDeleteOneInput = {
    query: {[key: string]: any}
}

// Deletes one document mathcing the query
export default function deleteOne(this: MongoController, options: TDeleteOneInput): Promise<TMethodResult> {
    return new Promise(async (resolve, reject) => {
        try {
            let { query } = options;
            let collection = this.collection;

            if (!collection) throw new Error('no collection specified');
            if (!query || Object.keys(query).length === 0) {
                throw new Error('no query specified');
            }

            const client = this.getClient()
            if (!client) throw new Error('client is null')

            const db = client.db(this.db.dbName);
            const col = db.collection(collection);

            let result = await col.findOneAndDelete(query);
            
            if (result.ok === 1 && result.value === null) {
                resolve({
                    ok: true,
                    details: 'done but seems like there was no such item',
                    result: {}
                });

                return;
            } else if (result.ok === 1 && result.value) {
                resolve({ ok:true,
                    details: 'done',
                    result: result
                });
                
                return;
            } else {
                throw new Error('unknown result that wasn\'t handled');
            }
        } catch (err) {
            // @ts-ignore
            resolve({ ok: false, details: 'error catched', error: err });
        }
    });
};