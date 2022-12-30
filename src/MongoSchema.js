import { getValueType } from './helpers.js';

const allowedTypes = [
    'any',
    'string',
    'number',
    'object',
    'array',
    'date',
    'boolean',
    'null'
];

class MongoSchema {
    constructor(schemaObj = {}, options = { debug: false, strict: false }) {
        
        this.settings = {
            debug: options.debug,
            strict: options.strict
        };

        this.schema = {};

        // Loop through the schemaObj, check types, recompile schema
        for (let [key, value] of Object.entries(schemaObj)) {
            this.specifySchema.call(this, key, value);
        }
    }

    // Function needed for recursive calls
    specifySchema(key, value, deepKey = []) {
        let checkType = null;

        if (typeof value === 'string') checkType = 'string';
        else if (typeof value === 'object' && !Array.isArray(value)) checkType = 'object';
        else if (typeof value === 'object' && Array.isArray(value)) checkType = 'array';

        switch (checkType) {
        case 'string':
            if (!allowedTypes.includes(value)) {
                throw new Error('The type ' + value + ' is not supported');
            }

            this.dynamicSave.call(this, key, deepKey, value);

            break;
        case 'object':
            for (let [objKey, objValue] of Object.entries(value)) {
                this.specifySchema.call(this, objKey, objValue, [...deepKey, key ]);
            }

            break;
        case 'array':
            value.forEach( el => {
                if (!allowedTypes.includes(el)) {
                    throw new Error('The type ' + el + ' is not supported');
                }
            });

            this.dynamicSave.call(this, key, deepKey, value);

            break;
        }
    }

    // Save value to deep keys of obj
    dynamicSave(key, deepKey, value) {
        // If there is a deep key
        if (deepKey.length === 1) {

            if (!this.schema[deepKey[0]]) this.schema[deepKey[0]] = {};
            this.schema[deepKey[0]][key] = value;

        } else if (deepKey.length > 1) {

            if (!this.schema[deepKey[0]]) this.schema[deepKey[0]] = {};
            if (!this.schema[deepKey[0]][deepKey[1]]) this.schema[deepKey[0]][deepKey[1]] = {};

            const lastKey = deepKey.pop();
            const nestedObj = deepKey.reduce((a, prop) => a[prop], this.schema);

            if (!nestedObj[lastKey]) nestedObj[lastKey] = {};
            nestedObj[lastKey][key] = value;

        } else {
            this.schema[key] = value;
        }
    }

    validate(data) {
        const logOn = true;
        let checks = [];

        function diveIntoObject(data, schema, deepKeys = []) {
            for (let [key, value] of Object.entries(schema)) {
                if (typeof value === 'object' && !Array.isArray(value)) {
                    diveIntoObject.call(this, data, schema[key], [ ...deepKeys, key]);
                }

                let isValidated = checkType.call(this, data, value, [ ...deepKeys, key]);
                checks.push(isValidated);
            }
        }

        function checkType(data, value, deepKeys) {
            if (logOn) {
                console.log('--');
                console.log(value);
                console.log(deepKeys);
            }

            const lastKey = deepKeys.pop();
            const nestedObj = deepKeys.reduce((a, prop) => a[prop], data);

            let isValidated = null;

            if (!nestedObj) {
                if (logOn) console.log(1);
                isValidated = false;
            } else if (value === 'any') {
                isValidated = true;
            } else if (typeof value === 'object' && !Array.isArray(value)) {
                if (logOn) console.log(2);
                isValidated = true;
            } else if (
                typeof value === 'object'
                && Array.isArray(value)
                && value.includes(getValueType(nestedObj[lastKey]))
            ) {
                if (logOn) console.log(3);
                isValidated = true;
            } else if (lastKey in nestedObj && value === getValueType(nestedObj[lastKey])) {
                if (logOn) console.log(4);
                isValidated = true;
            } else {
                if (logOn) console.log(99);
                isValidated = false;
            }

            if (logOn) console.log(isValidated);
            return isValidated;
        }
        
        diveIntoObject.call(this, data, this.schema);

        if (this.settings.debug) console.log('[MongoSchema] Validation result:', checks.every(el => el === true));

        return checks.every(el => el === true);
    }
}

export default MongoSchema;