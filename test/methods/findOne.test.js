import { MmMethods, MmMethodsNames, MongoMethods } from '../../dist/constants/methods.js';
import mongomod from '../../dist/mongomod.js';
import { mongoCreds } from '../env.js';

const findOneTestObj = {
    name: 'Xenia',
    age: 6
};

const db = new mongomod.Connection(mongoCreds);
await db.connect();
const collectionName = 'autotests-methods-' + MongoMethods.FindOne;
const ctrl = new mongomod.Controller(db, collectionName);
await ctrl.insertOne(findOneTestObj);

describe('FindOne. Input validation: wrong cases', () => {
  test('should throw an error if options is missing', async () => {
    await expect(ctrl.findOne()).rejects.toThrow();
  });

  test('should throw an error if options.filter is missing', async () => {
    await expect(ctrl.findOne({})).rejects.toThrow();
  });

    test('should throw an error if options.filter is not an object', async () => {
        await expect(ctrl.findOne({ filter: 'not an object' })).rejects.toThrow();
    });
});

describe('FindOne. Correct filter works', () => {
  test('should find one document in the collection', async () => {
    const result = await ctrl.findOne({ filter: {name: findOneTestObj.name}});

    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.name).toBe(findOneTestObj.name);
  });

  test('should find one document in the collection', async () => {
    const randomSuffix = String(Math.random().toString(36).substring(15));
    const options = { filter: {name: 'Unexisting' + randomSuffix }};
    const result = await ctrl.findOne(options);

    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(result.data).toBeNull(); // Should return null if no document found
  });
});

describe('FindOne. Clearing collection at the end of the test', () => {
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

describe('FindOne. Connection closing after tests', () => {
    test('should close the connection', async () => {
        await db.disconnect();
        expect(db.isConnected).toBe(false);
    });
})