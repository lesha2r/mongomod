import { MongoMethods } from "../constants/methods.js";
import { MmOperationErrCodes, MmOperationErrMsgs } from "../constants/operations.js";
import { MmOperationError } from "../errors/operationError.js";
import { MmValidationError } from "../errors/validationError.js";
import MongoController from "../MongoController.js";
import QueryResult from "../QueryResult.js";

export type MethodEnsureIndexOptions = {keys: string[]}[]

export interface MethodEnsureIndexResult {
    isChecked: boolean,
    byKeys: {[key: string]: boolean},
    passed: string[],
    failed: string[]
}

// Ensures index is created in collection
async function ensureIndex(this: MongoController, checkIndexesArr: MethodEnsureIndexOptions) {
    try {
        const client = this.getClient()
        const db = client.db(this.db.dbName);
        const col = db.collection(this.collection);

        const indexes = await col.indexes();
    
        const output: MethodEnsureIndexResult = {
            isChecked: false,
            byKeys: {},
            passed: [],
            failed: [],
        };
    
        checkIndexesArr.forEach((el, i) => {
        const checksRules: boolean[] = [];

        // @ts-ignore
        indexes.forEach((ind: {key: {[key: string]: any}}) => {
            const indexCheck: boolean[] = [];
    
            el.keys.forEach((k) => indexCheck.push(k in ind.key === true));
            const hasMatches = indexCheck.every((el) => el === true);
            const sameQty = el.keys.length <= Object.keys(ind.key).length;
            checksRules.push(hasMatches === true && sameQty === true);
        });
    
        const checkPassed = checksRules.some((el) => el === true);
        output.byKeys[el.keys.join('&')] = checkPassed;
    
        if (checkPassed) output.passed.push(el.keys.join('&'));
        else output.failed.push(el.keys.join('&'));
        });
    
        output.isChecked = Object.values(output.byKeys).every((el) => el === true);
    
        return new QueryResult(true, output);
    } catch (err: any) {
        if (err instanceof MmValidationError) throw err;

        throw new MmOperationError({
            code: MmOperationErrCodes.OperationFailed,
            message: `${MmOperationErrMsgs.OperationFailed}. ${err.message}`,
            dbName: this.db.dbName || null,
            operation: MongoMethods.EnsureIndex,
            originalError: err
        });

        // This line is unreachable but included for type consistency
        return new QueryResult(false, null);
    }
};

export default ensureIndex;