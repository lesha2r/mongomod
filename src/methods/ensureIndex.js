/**
 * @typedef TCheckResult
 * @property {boolean} isChecked final result
 * @property {{[key: string]: boolean}} byKeys each check result
 * @property {string[]} passed keys passed the test
 * @property {string[]} failed keys failed the test
 */

/**
 * Ensures index is created in collection
 * @param {{keys: string[]}[]} checkIndexesArr 
 * @returns {Promise<TCheckResult>} check result
 */
export default function ensureIndex(checkIndexesArr) {
    return new Promise(async (resolve, reject) => {
        const db = this.getClient().db(this.dbName);
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
    
        if (checkPassed) output.passed.push(el.keys.join('&'));
        else output.failed.push(el.keys.join('&'));
        });
    
        output.isChecked = Object.values(output.byKeys).every((el) => el === true);
    
        resolve(output);
    })
};