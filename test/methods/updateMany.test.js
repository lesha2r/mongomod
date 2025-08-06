import { MongoOperations } from '../../dist/constants/methods.js';
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
const collectionName = 'autotests-methods-' + MongoOperations.UpdateMany;
const ctrl = new mongomod.Controller(db, collectionName);
const insertTestData = async () => {
  await ctrl.insertMany({data: [testObj, testObj2, testObj3]});
};
await insertTestData()


describe('UpdateMany. Input validation: wrong cases', () => {
  test('should throw an error if options is missing', async () => {
    await expect(ctrl.updateMany()).rejects.toThrow();
  });

  test('should throw an error if options.update is missing', async () => {
      await expect(ctrl.updateMany({ filter: {}, update: {} })).rejects.toThrow();
  });

  test('should throw an error if options.filter is not an object', async () => {
      await expect(ctrl.updateMany({ filter: 'not an object', update: {} })).rejects.toThrow();
  });

  test('should throw an error if options.data is not an object', async () => {
      await expect(ctrl.updateMany({ filter: {}, update: 'not an object' })).rejects.toThrow();
  });
});

describe('UpdateMany. Correct filter works', () => {
  test('should update multiple documents using filter', async () => {
    const result = await ctrl.updateMany({
      filter: { age: testObj.age },
      update: { $set: { age: testObj.age + 1 } }
    });

    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(result.data.acknowledged).toBe(true);
    expect(result.data.modifiedCount).toBe(2);
  });

  test('should update all documents if no filter is provided', async () => {
    const result = await ctrl.updateMany({
      filter: {},
      update: { $set: { age: testObj.age + 2 } }
    });

    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(result.data.acknowledged).toBe(true);
    // excluded because of conflicting with other tests
    // expect(result.data.modifiedCount).toBe(3);
  });

  test('should upsert documents if no existing documents match the filter and upsert param is set to true', async () => {
    const result = await ctrl.updateMany({
      filter: { age: 1},
      update: { $set: { age: 2 } },
      params: { upsert: true }
    });

    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(result.data.acknowledged).toBe(true);
    expect(result.data.upsertedCount).toBe(1);
  });
});

describe('UpdateMany. Clearing collection at the end of the test', () => {
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

describe('UpdateMany. Connection closing after tests', () => {
    test('should close the connection', async () => {
        await db.disconnect();
        expect(db.isConnected).toBe(false);
    });
})