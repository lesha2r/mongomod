import { MongoMethods } from '../../dist/constants/methods.js';
import mongomod, {MmValidationError} from '../../dist/index.js';
import { mongoCreds } from '../env.js';

const db = new mongomod.Connection(mongoCreds);
await db.connect();
const collectionName = 'autotests-methods-' + MongoMethods.Count;
const ctrl = new mongomod.Controller(db, collectionName);

describe('Count. Adding fake data for testing', () => {
    test('should add fake data', async () => {
        const result = await ctrl.insertMany({
            data: [
                { name: 'counter1', value: 1 },
                { name: 'counter2', value: 2},
            ]
        })

        expect(result).toBeDefined();
        expect(result.ok).toBe(true);
    })
}) 

describe('Count. Input validation: wrong cases', () => {
    test('Call with null params throws a MmValidationError', async () => {
        await expect(ctrl.count(null)).rejects.toThrow(MmValidationError);
    });

    test('Call with empty array throws a MmValidationError', async () => {
        await expect(ctrl.count([])).rejects.toThrow(MmValidationError);
    });

    test('Call with unexisting parameter throws an MmValidationError', async () => {
        await expect(ctrl.count([
            { unexistingParams: {} }
        ])).rejects.toThrow(MmValidationError)
    });
});

describe('Count. Input validation: correct cases', () => {
    test('Call without parameters counts all documents', async () => {
        const result = await ctrl.count();
        expect(result).toBeDefined();
        expect(result.ok).toBe(true);
        expect(typeof result.data).toBe('number');
    });

    test('Call with correct params returns a QueryResult', async () => {
        const result = await ctrl.count({
            filter: {}
        });

        expect(result).toBeDefined();
        expect(result.ok).toBe(true);
        expect(typeof result.data).toBe('number');
    });
});

describe('Count. Clearing collection at the end of the test', () => {
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

describe('Count. Connection closing after tests', () => {
    test('should close the connection', async () => {
        await db.disconnect();
        expect(db.isConnected).toBe(false);
    });
})