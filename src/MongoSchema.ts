import { getValueType } from './utils/index.js';
import { EBsonType, TSchemaObj, TSchemaType } from './types/schema.js';

const allowedTypes: TSchemaType[] = [
    EBsonType.Any,
    EBsonType.String,
    EBsonType.Number,
    EBsonType.Object,
    EBsonType.Array,
    EBsonType.Date,
    EBsonType.Boolean,
    EBsonType.Null,
];

type TMongoSchemaOptions = { debug: boolean, strict: boolean }
type TMongoSchemaSettings = {debug: boolean, strict: boolean }
type TMongoSchemaValidationResult = {key: string, checked: boolean}

function checkType(data: {[key: string]: any}, value: any, deepKeys: string[]) {
    const lastKey: string = deepKeys.pop()!;
    const nestedObj: {[key: string]: any} = deepKeys.reduce((a, prop) => a[prop], data);

    let isValidated = null;

    if (!nestedObj) {
        isValidated = false;
    } else if (value === 'any') {
        isValidated = true;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
        isValidated = true;
    } else if (
        typeof value === 'object'
        && Array.isArray(value)
        && value.includes(getValueType(nestedObj[lastKey]))
    ) {
        isValidated = true;
    } else if (lastKey in nestedObj && value === getValueType(nestedObj[lastKey])) {
        isValidated = true;
    } else {
        isValidated = false;
    }

    return isValidated;
}

function diveIntoObject(
    this: MongoSchema,
    checks: {key: string, checked: boolean}[],
    data: {},
    schema: TSchemaObj,
    deepKeys: string[] = [],
    prevKey = null
) {
    for (let [key, value] of Object.entries(schema)) {
        if (typeof value === 'object' && !Array.isArray(value)) {
            diveIntoObject.call(
                this,
                checks,
                data,
                // @ts-ignore
                schema[key],
                [ ...deepKeys, key],
                [ ...deepKeys, key].join('.')
            );
        }

        const isValidated = checkType.call(this, data, value, [ ...deepKeys, key]);
        const keyPath = prevKey ? prevKey + '.' + key : key;

        checks.push({key: keyPath, checked: isValidated});
    }
}

class MongoSchema {
    settings: TMongoSchemaSettings
    schema: TSchemaObj

    constructor(
        schemaObj: TSchemaObj = {},
        options: TMongoSchemaOptions = { debug: false, strict: false }
    ) {
        
        this.settings = {
            debug: options.debug || false,
            strict: options.strict || true
        };

        this.schema = {};

        // Loop through the schemaObj, check types, recompile schema
        for (let [key, value] of Object.entries(schemaObj)) {
            this.specifySchema.call(this, key, value);
        }
    }

    // Function needed for recursive calls
    specifySchema(key: string, value: any, deepKey: string[] = []) {
        let checkType = null;

        if (typeof value === 'string') {
            checkType = 'string';
        } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            checkType = 'object';
        } else if (value !== null && typeof value === 'object' && Array.isArray(value)) {
            checkType = 'array';
        }

        switch (checkType) {
        case 'string':
            if (!allowedTypes.includes(value)) {
                throw new Error(`Type '${value}' is not supported`);
            }

            this.dynamicSave.call(this, key, deepKey, value);

            break;
        case 'object':
            for (let [objKey, objValue] of Object.entries(value)) {
                this.specifySchema.call(this, objKey, objValue, [...deepKey, key ]);
            }

            break;
        case 'array':
            value.forEach((el: any) => {
                if (!allowedTypes.includes(el)) {
                    throw new Error(`Type '${el}' is not supported`);
                }
            });

            this.dynamicSave.call(this, key, deepKey, value);

            break;
        }
    }

    // Save value to deep keys of obj
    dynamicSave(key: string, deepKey: string[], value: TSchemaType) {
        // If there is a deep key
        if (deepKey.length === 1) {
            if (!this.schema[deepKey[0]]) this.schema[deepKey[0]] = {};

            // @ts-ignore
            this.schema[deepKey[0]][key] = value;
        } else if (deepKey.length > 1) {
            if (!this.schema[deepKey[0]]) this.schema[deepKey[0]] = {};
            // @ts-ignore
            if (!this.schema[deepKey[0]][deepKey[1]]) this.schema[deepKey[0]][deepKey[1]] = {};

            const lastKey: string = deepKey.pop()!;
            // @ts-ignore
            const nestedObj = deepKey.reduce((a, prop) => a[prop], this.schema);
            // @ts-ignore
            if (!nestedObj[lastKey]) nestedObj[lastKey] = {};
            // @ts-ignore
            nestedObj[lastKey][key] = value;
        } else {
            this.schema[key] = value;
        }
    }

    validate(data: {[key: string]: any}) {
        const checks: TMongoSchemaValidationResult[] = [];
        
        diveIntoObject.call(this, checks, data, this.schema);

        if (this.settings.debug) {
            const validationResult = checks.every(el => el.checked === true)
            console.log('[MongoSchema] Validation result:', validationResult);
        }

        const failed = checks.filter(el => el.checked !== true).map(el => el.key)

        return {failed, result: failed.length === 0}
    }
}

const test = () => {
    const testSchema = {
        name: 'string',
        address: {
            city: 'string',
            coordinates: {
                x: 'number',
                y: 'number'
            }
        }
    };

    // @ts-ignore
    const schema = new MongoSchema(testSchema);

    const badData = {
        name: "John",
        address: {
            city: 'Moscow',
            coordinates: {
                x: 1,
                y: '2'
            }
        }
    };

    schema.validate(badData)
}

test()

export default MongoSchema;