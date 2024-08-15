import mongomod from '../dist/mongomod.js';

const testSchema = {
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

const testData = {
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
    const allTypesSchema = {
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
    const badSchema = {
        ...testSchema,
        name: 'WRONG'
    };

    expect(() => new mongomod.Schema(badSchema)).toThrow();
});

test('validating data with correct schema returns true', () => {
    const schema = new mongomod.Schema(testSchema);

    expect(schema.validate(testData)).toMatchObject({result: true});
});

test('validating data with wrong schema returns false', () => {
    const schema = new mongomod.Schema(testSchema);

    const badData = {
        ...testData,
        age: '12'
    };

    expect(schema.validate(badData)).toMatchObject({result: false});
});

