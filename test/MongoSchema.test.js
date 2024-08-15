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
    },
    friends: ['array', 'null'],
    lastVisitDate: 'date',
    isActive: 'boolean',
    object: 'object'
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
    },
    friends: ['John', 'Kate'],
    lastVisitDate: new Date(),
    isActive: true,
    object: {}
};

test('creating schema using good types succeed', () => {
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

test('creating schema using bad type throws', () => {
    const badType = 'wrong'

    const badSchema = {
        ...testSchema,
        name: badType
    };

    expect(() => new mongomod.Schema(badSchema)).toThrow(`Type '${badType}' is not supported`);
});

test('correct data passes validation', () => {
    const schema = new mongomod.Schema(testSchema);

    expect(schema.validate(testData)).toMatchObject({result: true});
});

test('correct field with multiple types passes validation', () => {
    const schema = new mongomod.Schema(testSchema);

    const data1 = {
        ...testData,
        friends: null
    };
    const check1 = schema.validate(data1)

    const data2 = {
        ...testData,
        friends: []
    };
    const check2 = schema.validate(data1)

    expect(check1).toMatchObject({result: true});
    expect(check2).toMatchObject({result: true});
});

test('incorrect field (type: number) fails validation', () => {
    const schema = new mongomod.Schema(testSchema);

    const badData = {
        ...testData,
        age: '12'
    };

    expect(schema.validate(badData)).toMatchObject({result: false, failed: ['age']});
});

test('incorrect field (type: string) fails validation', () => {
    const schema = new mongomod.Schema(testSchema);

    const badData = {
        ...testData,
        name: null
    };

    expect(schema.validate(badData)).toMatchObject({result: false, failed: ['name']});
});

test('incorrect field (type: boolean) fails validation', () => {
    const schema = new mongomod.Schema(testSchema);

    const badData = {
        ...testData,
        isActive: null
    };

    expect(schema.validate(badData)).toMatchObject({result: false, failed: ['isActive']});
});

test('incorrect field (type: [null, array]) fails validation', () => {
    const schema = new mongomod.Schema(testSchema);

    const badData = {
        ...testData,
        friends: true
    };

    expect(schema.validate(badData)).toMatchObject({result: false, failed: ['friends']});
});

test('incorrect null field (w type: object) fails validation', () => {
    const schema = new mongomod.Schema(testSchema);

    const badData = {
        ...testData,
        object: null
    };

    expect(schema.validate(badData)).toMatchObject({result: false, failed: ['object']});
});

test('incorrect deep field fails validation', () => {
    const schema = new mongomod.Schema(testSchema);

    const badData = {
        ...testData,
    };

    // @ts-ignore
    badData.address.city = 77

    expect(schema.validate(badData)).toMatchObject({result: false, failed: ['address.city']});
});

test('incorrect deep field x2 fails validation', () => {
    const schema = new mongomod.Schema(testSchema);

    const badData = {...testData};

    // @ts-ignore
    badData.address.city = 77
    // @ts-ignore
    badData.address.coordinates.x = 'unknown'

    const validationResult = schema.validate(badData)

    expect(validationResult.result).toBe(false)
    expect(validationResult.failed).toContain('address.city')
    expect(validationResult.failed).toContain('address.coordinates.x')
});

