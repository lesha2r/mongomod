import { MongoMethods } from '../../dist/constants/methods.js';
import mongomod from '../../dist/mongomod.js';
import { mongoCreds } from '../env.js';

const testObj = {
    name: 'Alex',
    age: 24,
};

const testObj2 = {
    name: 'Alice',
    age: testObj.age,
}

const testObj3 = {
    name: 'Axel',
    age: testObj.age - 5,
}

const db = new mongomod.Connection(mongoCreds);
await db.connect();
const collectionName = 'autotests-methods-' + MongoMethods.DeleteMany;
const ctrl = new mongomod.Controller(db, collectionName);
const insertTestData = async () => {
  await ctrl.insertMany({data: [testObj, testObj2, testObj3]});
};
await insertTestData()

describe('DeleteMany. Input validation: wrong cases', () => {
  test('should throw an error if options is missing', async () => {
    await expect(ctrl.deleteMany()).rejects.toThrow();
  });

    test('should throw an error if options.filter is missing', async () => {
    await expect(ctrl.deleteMany({})).rejects.toThrow();
  });

  test('should throw an error if options.filter is not an object', async () => {
      await expect(ctrl.deleteMany({ filter: 'not an object' })).rejects.toThrow();
  });
});

describe('DeleteMany. Correct filter works', () => {
  test('should delete one document by filter  ', async () => {
    const result = await ctrl.deleteMany({
      filter: { age: testObj.age },
    });

    const findResult = await ctrl.findMany({ filter: {} });

    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(findResult.ok).toBe(true);
    expect(findResult.data.length).toBe(1);
  });

  test('should delete all documents by filter = {}', async () => {
    await insertTestData() // Reinsert data to ensure we have multiple documents
    const countResult = await ctrl.count()
    expect(countResult.data).toBeGreaterThanOrEqual(3); // Ensure we have 3 documents before

    const result = await ctrl.deleteMany({
      filter: {}
    });

    expect(result).toBeDefined();
    expect(result.ok).toBe(true);

    const findResult = await ctrl.findMany({ filter: {} });

    expect(findResult.ok).toBe(true);
    expect(findResult.data.length).toBe(0);
  });
});

describe('DeleteMany. Clearing collection at the end of the test', () => {
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

describe('DeleteMany. Connection closing after tests', () => {
    test('should close the connection', async () => {
        await db.disconnect();
        expect(db.isConnected).toBe(false);
    });
})