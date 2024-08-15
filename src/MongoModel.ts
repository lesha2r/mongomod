import _ from 'lodash';
import MongoSchema from "./MongoSchema.js";
import MongoController from "./MongoController.js";
import MongoConnection from "./MongoConnection.js";

class MongoModel extends MongoController {
    schema: MongoSchema
    modelData: null | {[key: string]: any}
    db: MongoConnection

    constructor (db: MongoConnection, collection: string, schema: MongoSchema) {
        super(db, collection);

        this.collection = collection;
        this.schema = schema;
        this.db = db;

        this.modelData = null;
    }

    data() {
        return this.modelData;
    }

    // Filters data by allowedKeys (top-level only)
    dataFiltered(allowedKeys: string[]): {[key: string]: any} | null {
        if (this.modelData === null) return null
        
        const output: {[key: string]: any} = {};

        Object.keys(this.modelData).forEach(key => {
            if (this.modelData && allowedKeys.includes(key)) {
                output[key] = this.modelData[key];
            }
        });

        return output;
    }

    // Returns modelData as stringified JSON
    toString(): string {
        if (!this.modelData) return ""
        return JSON.stringify(this.modelData);
    }

    // Validates modelData by it's schema
    validate() {
        if (!this.modelData) return false;

        const isValidated = this.schema.validate(this.modelData);

        if (this.schema.settings.strict === true) this.clearBySchema();

        return isValidated;
    }

    // Force modelData to have only keys allowed by schema
    clearBySchema() {
        const schema = this.schema.schema;

        if (Object.keys(schema).length === 0) {
            throw new Error('Can\'t clear data since scheme is empty');
        }

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
        function filterDataBySchema(key: string, value: any, deepKeys: string[] = [], prevResult = {}): {[key:string]: any} {
            let result;
            let handleType = null;

            if (typeof value === 'string') {
                handleType = 'final';
            } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                handleType = 'object';
            } else if (value !== null && typeof value === 'object' && Array.isArray(value)) {
                handleType = 'final';
            }

            switch (handleType) {
            case 'final':
                const caseResult = dynamicSave(currentModelData, key, deepKeys);
                result = _.merge(prevResult, caseResult);
                break;
            case 'object':
                for (let [objKey, objValue] of Object.entries(value)) {
                    const caseResult = filterDataBySchema(
                        objKey,
                        objValue, 
                        [...deepKeys, key ],
                        result
                    );
                    
                    result = _.merge(prevResult, caseResult);
                }
    
                break;
            }

            return result;
        }

        function dynamicSave(dataObj: {[key: string]: any}, key: string, deepKey: string[]) {
            const saveObj: {[key: string]: any} = {};
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
    
                const lastKey: string = deepKey.pop()!;
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

    // Creates item without saving it to db
    init(data: {[key: string] : any}) {
        const validation = this.schema.validate(data);

        if (validation.result === false) {
            throw new Error(`Scheme validation failed: ${validation.failed.join(', ')}`);
        }

        this.modelData = data;

        return this;
    }

    // Change item's data
    set(data: {[key: string]: any}) {
        const newData = { ...this.modelData, ...data };

        const validation = this.schema.validate(newData);
        if (validation.result === false) {
            throw new Error(`Scheme validation failed: ${validation.failed.join(', ')}`);
        }

        this.modelData = newData;

        return this;
    }

    // Inserts model to db
    async insert() {
        try {
            if (!this.modelData) throw new Error('modelData is empty')

            const result = await this.insertOne({
                'data': this.modelData
            });

            if (!result.ok) {
                throw new Error('failed to insert model')
            } else if (result.ok && 'insertedId' in result.result) {
                this.modelData._id = result.result.insertedId
            }

            return this;
        } catch (err) {
            throw new Error('failed to insert model')
        }
    }

    // Pulls data for the model by the specified query and stores it 
    async get(query: {[key: string]: any} = {}) {
        try {
            let found = await this.findOne({ query: query });
            
            if (found.ok) this.modelData = found.result;
            if (found.result === null) throw new Error('Nothing found');
            
            return this;
        } catch (err) {
            throw err
        }
    }

    // Saves current model data into the db
    async save(insertNew: boolean = false) {
        try {
            if (!this.modelData) throw new Error('modelData is empty')

            if (insertNew === true) {
                await this.insert();
            } else {
                if (!this.modelData._id) throw new Error('modelData._id is required');

                await this.updateOne({
                    query: { _id: this.modelData._id },
                    data: this.modelData
                });
            }

            return this;
        } catch (err) {
            throw err;
        }
    }

    // Deletes current item from db
    async delete() {
        try {
            if (!this.modelData) throw new Error('modelData is empty')
            else if (!this.modelData._id) throw new Error('modelData._id is required');

            await this.deleteOne({
                query: { _id: this.modelData._id },
            });

            this.modelData = null;

            return this;
        } catch (err) {
            throw err;
        }
    }
}

export default MongoModel;
