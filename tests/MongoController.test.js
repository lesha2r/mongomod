import mongomod from '../dist/index.js'
import { MongoClient } from 'mongodb';
import { mongoCreds } from './env.js';

// Docs:
// Basic usage is tested here
// Deep tests are in test/methods/*.test.js

const brokenCreds = {
    link: 'test.dummy.link:27888',
    login: 'login',
    password: 'pass',
    dbName: 'dbName'
};

describe('MongoController constructor', () => {
    test('should throw error if db is not an instance of MongoConnection', () => {
        expect(() => new mongomod.Controller({}, 'test-collection')).toThrow(mongomod.MmControllerError);
        expect(() => new mongomod.Controller(null, 'test-collection')).toThrow(mongomod.MmControllerError);
    });

    test('should throw error if collection is not a string', () => {
        const db = new mongomod.Connection(brokenCreds);
        expect(() => new mongomod.Controller(db, 123)).toThrow(mongomod.MmControllerError);
        expect(() => new mongomod.Controller(db, null)).toThrow(mongomod.MmControllerError);
    })
});

describe('MongoController db and client methods', () => {
    test('unconnected client throws error', () => {
        const db = new mongomod.Connection(brokenCreds);
        const ctrl = new mongomod.Controller(db, 'test-collection')
        expect(() => ctrl.getClient()).toThrow(mongomod.MmControllerError);
    })

    test('connected client returns MongoClient instance', async () => {
        const db = new mongomod.Connection(mongoCreds);
        await db.connect();
        const ctrl = new mongomod.Controller(db, 'test-collection');
        
        expect(ctrl.getClient()).toBeInstanceOf(MongoClient);
        await db.disconnect()
    })
})

const db = new mongomod.Connection(mongoCreds);
await db.connect();
const ctrl = new mongomod.Controller(db, 'autotests-mongo-ctrl');
await ctrl.deleteMany({filter: {}})
const countAlias = async () => {
    const result = await ctrl.count()
    return result.data
}
const TEST_NAME = 'test'

describe('MongoController methods works as expected', () => {


    test('MongoController.count works', async () => {
        const result = await ctrl.count();
        expect(result.ok).toBe(true);
        expect(result.data).toBe(0);
    });

    test('MongoController.insertOne works', async () => {
        const result = await ctrl.insertOne({ name: TEST_NAME + '1' });
        expect(result.ok).toBe(true);
        expect(result.data).not.toHaveProperty('insertedId');
        expect(await countAlias()).toBe(1);
    })

    test('MongoController.insertMany works', async () => {
        const result = await ctrl.insertMany({data: [{name: TEST_NAME + '2'}, {name: TEST_NAME + '3'}]});
        expect(result.ok).toBe(true);
        expect(result.data).not.toHaveProperty('insertedIds');
        expect(await countAlias()).toBe(3);
    })

    test('MongoController.findOne does not returns unexisting docs', async () => {
        const result = await ctrl.findOne({ filter: {name: TEST_NAME + 'unexisting' }});
        expect(result.ok).toBe(true);
        expect(result.data).toEqual(null);
    });

    test('MongoController.findOne works', async () => {
        const result = await ctrl.findOne({ filter: {name: TEST_NAME + '1' }});
        expect(result.ok).toBe(true);
        expect(result.data).toHaveProperty('_id');
        expect(result.data.name).toBe(TEST_NAME + '1');
    });

    test('MongoController.deleteOne works', async () => {
        const result = await ctrl.deleteOne({ filter: {name: TEST_NAME + '1' }});
        expect(result.ok).toBe(true);
        expect(await countAlias()).toBe(2);
    });

    test('MongoController.findMany works', async () => {
        const result = await ctrl.findMany({ filter: {}});
        const count = await countAlias();
        expect(result.ok).toBe(true);
        expect(result.data.length).toBe(count);
        expect(result.data[0].name).toBe(TEST_NAME + '2');
        expect(result.data[1].name).toBe(TEST_NAME + '3');
    });

    test('MongoController.updateOne works', async () => {
        const result = await ctrl.updateOne({ filter: {name: TEST_NAME + '2' }, update: {name: TEST_NAME + '2updated'}});
        expect(result.ok).toBe(true);
        expect(await countAlias()).toBe(2);
        const findResult = await ctrl.findOne({ filter: {name: TEST_NAME + '2updated' }});
        expect(findResult.ok).toBe(true);
        expect(findResult.data.name).toBe(TEST_NAME + '2updated');
    });

    test('MongoController.updateMany works', async () => {
        const result = await ctrl.updateMany({ filter: {}, update: {name: TEST_NAME + 'X', updated: true}});
        expect(result.ok).toBe(true);
        expect(await countAlias()).toBe(2);

        const found = await ctrl.findMany({ filter: {} });
        expect(found.ok).toBe(true);
        expect(found.data[0].name).toBe(TEST_NAME + 'X');
        expect(found.data[0].updated).toBe(true);
        expect(found.data[1].name).toBe(TEST_NAME + 'X');
        expect(found.data[1].updated).toBe(true);
    })

    test('MongoController.updateMany works with upsert', async () => {
        const result = await ctrl.updateMany({
            filter: { name: TEST_NAME + 'unexisting' },
            update: { name: TEST_NAME + 'unexisting', upserted: true},
            params: {upsert: true}
        });
        expect(result.ok).toBe(true);
        expect(await countAlias()).toBe(3);

        const found = await ctrl.findMany({ filter: {} });
        expect(found.ok).toBe(true);
        expect(found.data.length).toBe(3);
        expect(found.data[2].name).toBe(TEST_NAME + 'unexisting');
    })

    test('MongoController.deleteMany works', async () => {
        const result = await ctrl.deleteMany({ filter: {upserted: true} });
        expect(result.ok).toBe(true);
        expect(await countAlias()).toBe(2);
    });

    test('MongoController.distinct works', async () => {
        const result = await ctrl.distinct({ field: 'name' });
        expect(result.ok).toBe(true);
        expect(result.data.includes(TEST_NAME + 'X')).toBe(true);
    });

    test('MongoController.aggregate works', async () => {
        const result = await ctrl.aggregate([
            { $match: { name: TEST_NAME + 'X' } },
            { $group: { _id: '$name', count: { $sum: 1 } } }
        ]);

        expect(result.ok).toBe(true)
        expect(result).toEqual({
            ok: true,
            data: [
                {
                    _id: TEST_NAME + 'X',
                    count: 2
                }
            ],
            error: null
        });
    })

    test('MongoController.deleteMany works and clear collection', async () => {
        const result = await ctrl.deleteMany({filter: {}});
        expect(result.ok).toBe(true);
        expect(await countAlias()).toBe(0);
    })
})

describe('MongoController disconnect works, test suite finished', () => {
    test('Disconnects from MongoDB', async () => {
        await ctrl.db.disconnect();
        expect(ctrl.db.isConnected).toBe(false);
    });
})

