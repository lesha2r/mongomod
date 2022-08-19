import mongomod from '../src/mongomod.js';

let testSchema = {
    name: 'string',
    age: 'number',
    address: {
        city: 'string',
        coordinates: {
            x: 'number',
            y: 'number'
        }
    }
};

let testData = {
    name: 'Bob',
    age: 12,
    address: {
        city: 'Moscow',
        coordinates: {
            x: 1,
            y: 2
        }
    }
};

test('creating schema created with bad argument throws error', () => {
    let allTypesSchema = {
        'any': 'any',
        'string': 'string',
        'number': 'number',
        'object': 'object',
        'array': 'array',
        'date': 'date',
        'boolean': 'boolean',
        'null': 'null'
    };

    expect(() => new mongomod.Schema(allTypesSchema)).not.toThrow();
});

test('creating schema created with bad argument throws error', () => {
    let brokenSchema = {
        ...testSchema,
        name: 'WRONG'
    };

    expect(() => new mongomod.Schema(brokenSchema)).toThrow();
});

test('validating data with correct schema returns true', () => {
    let schema = new mongomod.Schema(testSchema);

    expect(schema.validate(testData)).toBe(true);
});

test('validating data with wrong schema returns false', () => {
    let schema = new mongomod.Schema(testSchema);

    let brokenData = {
        ...testData,
        age: '12'
    };

    expect(schema.validate(brokenData)).toBe(false);
});

