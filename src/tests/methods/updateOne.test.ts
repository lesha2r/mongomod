import mongomod from '../../mongomod.js';
import { MmControllerOperations } from '../../constants/controller.js';
import { mongoCreds } from '../env.js';
import { describe, test, expect } from '@jest/globals';

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
const collectionName = 'autotests-methods-' + MmControllerOperations.UpdateOne;
const ctrl = new mongomod.Controller(db, collectionName);
const insertTestData = async () => {
  await ctrl.insertMany({data: [testObj, testObj2, testObj3]});
};
await insertTestData()


describe('UpdateOne. Input validation: wrong cases', () => {
  test('should throw an error if options is missing', async () => {
    // @ts-expect-error
    await expect(ctrl.updateOne()).rejects.toThrow();
  });

  test('should throw an error if options.update is missing', async () => {
      await expect(ctrl.updateOne({ filter: {}, update: {} })).rejects.toThrow();
  });

  test('should throw an error if options.filter is not an object', async () => {
    // @ts-expect-error
    await expect(ctrl.updateOne({ filter: 'not an object', update: {} })).rejects.toThrow();
  });

  test('should throw an error if options.update is not an object', async () => {
    // @ts-expect-error
    await expect(ctrl.updateOne({ filter: {}, update: 'not an object' })).rejects.toThrow();
  });
});

describe('UpdateOne. Correct filter works', () => {
  test('should update first document by filter', async () => {
    const result = await ctrl.updateOne({
      filter: { age: testObj.age },
      update: { $set: { age: testObj.age + 1 } }
    });

    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data && !Array.isArray(result.data) ? result.data.name : undefined).toBe(testObj.name);
    expect(result.data && !Array.isArray(result.data) ? result.data.age : undefined).toBe(testObj.age + 1);
  });

  test('should upsert document if no existing documents match the filter and upsert param is set to true', async () => {
    const result = await ctrl.updateOne({
      filter: { name: 'NewName'},
      update: { $set: { age: 2 } },
      params: { upsert: true }
    });

    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(result.data && !Array.isArray(result.data) ? result.data.name : undefined).toBe('NewName');
    expect(result.data && !Array.isArray(result.data) ? result.data.age : undefined).toBe(2);
  });

  test('shouldn\'t upsert document if no existing documents match the filter and upsert is not set', async () => {
    const result = await ctrl.updateOne({
      filter: { name: 'UnexistingName'},
      update: { $set: { age: 33 } },
      params: { upsert: false }
    });

    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(result.data).toBeNull()
  });

  

  test('document update works even if $set is not used', async () => {
    const newAge = 40

    const result = await ctrl.updateOne({
      filter: { name: testObj3.name},
      update: { age: newAge },
    });

    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(result.data && !Array.isArray(result.data) ? result.data.name : undefined).toBe(testObj3.name);
    expect(result.data && !Array.isArray(result.data) ? result.data.age : undefined).toBe(newAge);
  });
});

describe('UpdateOne. Clearing collection at the end of the test', () => {
  test('should clear the collection', async () => {
    const filter = {}
    await ctrl.deleteMany({filter});

    const result = await ctrl.findMany({filter});
    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data?.length).toBe(0);
  });
});

describe('UpdateOne. Connection closing after tests', () => {
    test('should close the connection', async () => {
        await db.disconnect();
        expect(db.isConnected).toBe(false);
    });
})
