import { MongoMethods } from '../../dist/constants/methods.js';
import mongomod, {MmOperationError, MmValidationError} from '../../dist/index.js';
import { mongoCreds } from '../env.js';

const testObj = {
    name: 'Arnold',
    age: 4,
};

const db = new mongomod.Connection(mongoCreds);
await db.connect();
const collectionName = 'autotests-methods-' + MongoMethods.Aggregate;
const ctrl = new mongomod.Controller(db, collectionName);
await ctrl.insertOne(testObj);

describe('Aggregate. Input validation: wrong cases', () => {
    test('Call without parameters throws a MmValidationError', async () => {
        await expect(ctrl.aggregate()).rejects.toThrow(MmValidationError);
    });

    test('Call with empty params throws a MmValidationError', async () => {
        await expect(ctrl.aggregate()).rejects.toThrow(MmValidationError);
    });

    test('Call with null params throws a MmValidationError', async () => {
        await expect(ctrl.aggregate(null)).rejects.toThrow(MmValidationError);
    });

    test('Call with empty array throws a MmValidationError', async () => {
        await expect(ctrl.aggregate([])).rejects.toThrow(MmValidationError);
    });

    test('Call with non-array params throws a MmValidationError', async () => {
        await expect(ctrl.aggregate({})).rejects.toThrow(MmValidationError);
    });

    test('Call with unexisting atomic operator throws an MmOperationError', async () => {
        await expect(ctrl.aggregate([
            { $match: { name: 'test' } },
            { $group: { _id: '$name', count: { $sum: 1 } } },
            { $unexistingOperator: {} }
        ])).rejects.toThrow(MmOperationError)
    });
});

describe('Aggregate. Input validation: correct cases', () => {
    test('Call with correct params returns a QueryResult', async () => {
        const result = await ctrl.aggregate([
            { $match: { name: 'test' } },
            { $group: { _id: '$name', count: { $sum: 1 } } }
        ]);

        console.log(result)

        expect(result).toBeDefined();
        expect(result.ok).toBe(true);
        expect(Array.isArray(result.data)).toBe(true);
    })
});

describe('FindMany. Clearing collection at the end of the test', () => {
  test('should clear the collection', async () => {
    const filter = {}
    await ctrl.deleteMany({filter});

    const result = await ctrl.findMany({filter});
    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBe(0);
  });
});

describe('Aggregate. Connection closing after tests', () => {
    test('should close the connection', async () => {
        await db.disconnect();
        expect(db.isConnected).toBe(false);
    });
})