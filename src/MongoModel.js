import MongoController from "./MongoController.js";
import _ from 'lodash';

class MongoModel extends MongoController {
    constructor (db, collection, schema) {
        super(db, collection);

        this.collection = collection;
        this.schema = schema;
        this.db = db;

        this.modelData = null;
    }

    data() {
        return this.modelData;
    }

    /**
     * Filters data by allowedKeys (top-level only)
     * @param {string[]} allowedKeys list of allowed keys
     * @returns {object} filtered object
     */
    dataFiltered(allowedKeys) {
        const output = {};

        Object.keys(this.modelData).forEach( key => {
            if (allowedKeys.includes(key)) output[key] = this.modelData[key];
        });

        return output;
    }

    /**
     * Returns modelData as stringified JSON
     * @returns {string} stringified modelData
     */
    toString() {
        return JSON.stringify(this.modelData);
    }

    /**
     * Validates modelData by it's schema
     * @returns {boolean} validation result
     */
    validate() {
        const isValidated = this.schema.validate(this.modelData);

        if (this.schema.settings.strict === true) this.clearBySchema();

        return isValidated;
    }

    /**
     * Force modelData to have only keys allowed by schema
     * @returns {object} the model instance
     */
    clearBySchema() {
        const schema = this.schema.schema;

        if (Object.keys(schema).length === 0) throw new Error('Can\'t clear data since scheme is empty');

        const currentModelData = { ...this.modelData };
        let newModelData = {};
        const _id = currentModelData._id;
        
        // Clear top level keys that are not in schema
        for (let key in currentModelData) {
            if (key in schema === false) delete currentModelData[key];
        }
    
        // Loop through the schema, check types, recompile schema
        for (let [key, value] of Object.entries(schema)) {
            newModelData = {
                ...newModelData,
                ...filterDataBySchema(key, value, [])
            };
        }

        this.modelData = newModelData;
        if (_id) this.modelData._id = _id;
    
        // Function needed for recursive calls
        function filterDataBySchema(key, value, deepKeys = [], prevResult = {}) {
            let result;
            let handleType = null;

            if (typeof value === 'string') handleType = 'final';
            else if (typeof value === 'object' && !Array.isArray(value)) handleType = 'object';
            else if (typeof value === 'object' && Array.isArray(value)) handleType = 'final';

            switch (handleType) {
            case 'final':
                let caseResult = dynamicSave(currentModelData, key, deepKeys);
                
                result = _.merge(prevResult, caseResult);
                
                break;
            case 'object':
                for (let [objKey, objValue] of Object.entries(value)) {
                    let caseResult = filterDataBySchema(objKey, objValue, [...deepKeys, key ], result);
                    
                    result = _.merge(prevResult, caseResult);
                }
    
                break;
            }

            return result;
        }

        function dynamicSave(dataObj, key, deepKey) {
            const saveObj = {};
            let value = dataObj[key];
            
            // If there is a deep key
            if (deepKey.length === 1) {
                value = dataObj[deepKey[0]][key];
    
                if (!saveObj[deepKey[0]]) saveObj[deepKey[0]] = {};
    
                saveObj[deepKey[0]][key] = value;
    
            } else if (deepKey.length > 1) {
                if (!saveObj[deepKey[0]]) saveObj[deepKey[0]] = {};
    
                if (!saveObj[deepKey[0]][deepKey[1]]) {
                    saveObj[deepKey[0]][deepKey[1]] = {};
                }
    
                const lastKey = deepKey.pop();
                const nestedDataObj = deepKey.reduce((a, prop) => a[prop], dataObj);
                const nestedObj = deepKey.reduce((a, prop) => a[prop], saveObj);
    
                value = nestedDataObj[lastKey][key];
    
                if (!nestedObj[lastKey]) nestedObj[lastKey] = {};
                nestedObj[lastKey][key] = value;
    
            } else {
                saveObj[key] = value;
            }
    
            return saveObj;
        }

        return this;
    }

    /**
     * Creates item without saving it to db
     * @param {object} data to be stored as modelData
     * @returns the model instance
     */
    init(data) {
        const validation = this.schema.validate(data);
        if (validation.result === false) {
            throw new Error(`Scheme validation failed: ${validation.failed.join(', ')}`);
        }

        this.modelData = data;

        return this;
    }

    /**
     * Change item's data
     * @param {object} data to be added/modified. Uses spread combining { ...current, ...new }
     * @returns the model instance
     */
    set(data) {
        const newData = { ...this.modelData, ...data };

        const validation = this.schema.validate(newData);
        if (validation.result === false) {
            throw new Error(`Scheme validation failed: ${validation.failed.join(', ')}`);
        }

        this.modelData = newData;

        return this;
    }

    /**
     * Inserts model to db
     * @returns {object} 
     */
    insert() {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await this.insertOne({
                    data: this.modelData
                });

                resolve(this);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Pulls data for the model by the specified query and stores it 
     * @param  { Object } query regular MongoDB query object
     * @returns {Promise<object>} the model instance
     */
    get(query = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                let found = await this.findOne({ query: query });
                
                if (found.ok) this.modelData = found.result;
                if (found.result === null) throw new Error('Nothing found');
                
                resolve(this);
            } catch (err) {
                reject(err);
            }
        });
    }

    // 
    /**
     * Saves current model data into the db
     * @param {boolean} insertNew should be inserted as new document
     * @returns {Promise<object>} the model instance
     */
    save(insertNew = false) {
        if (insertNew === true) return this.insert();

        if (!this.modelData._id) throw new Error('this.modelData._id is required');
        
        return new Promise(async (resolve, reject) => {
            try {
                let result = await this.updateOne({
                    query: { _id: this.modelData._id },
                    data: this.modelData
                });

                resolve(this);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Deletes current item from db
     * @returns {Promise<object>} the model instance
     */
    delete() {
        if (!this.modelData._id) throw new Error('this.modelData._id is required');

        return new Promise(async (resolve, reject) => {
            try {
                let result = await this.deleteOne({
                    query: { _id: this.modelData._id },
                });

                this.modelData = null;

                resolve(this);
            } catch (err) {
                reject(err);
            }
        });
    }
}

export default MongoModel;
