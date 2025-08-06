import { MongoMethods } from "../constants/methods.js";
import { MmOperationErrCodes, MmOperationErrMsgs } from "../constants/operations.js";
import { MmOperationError } from "../errors/operationError.js";
import { MmValidationError } from "../errors/validationError.js";
import QueryResult from "../QueryResult.js";
async function ensureIndex(checkIndexesArr) {
    try {
        const client = this.getClient();
        const db = client.db(this.db.dbName);
        const col = db.collection(this.collection);
        const indexes = await col.indexes();
        const output = {
            isChecked: false,
            byKeys: {},
            passed: [],
            failed: [],
        };
        checkIndexesArr.forEach((el, i) => {
            const checksRules = [];
            indexes.forEach((ind) => {
                const indexCheck = [];
                el.keys.forEach((k) => indexCheck.push(k in ind.key === true));
                const hasMatches = indexCheck.every((el) => el === true);
                const sameQty = el.keys.length <= Object.keys(ind.key).length;
                checksRules.push(hasMatches === true && sameQty === true);
            });
            const checkPassed = checksRules.some((el) => el === true);
            output.byKeys[el.keys.join('&')] = checkPassed;
            if (checkPassed)
                output.passed.push(el.keys.join('&'));
            else
                output.failed.push(el.keys.join('&'));
        });
        output.isChecked = Object.values(output.byKeys).every((el) => el === true);
        return new QueryResult(true, output);
    }
    catch (err) {
        if (err instanceof MmValidationError)
            throw err;
        throw new MmOperationError({
            code: MmOperationErrCodes.OperationFailed,
            message: `${MmOperationErrMsgs.OperationFailed}. ${err.message}`,
            dbName: this.db.dbName || null,
            operation: MongoMethods.EnsureIndex,
            originalError: err
        });
        return new QueryResult(false, null);
    }
}
;
export default ensureIndex;
