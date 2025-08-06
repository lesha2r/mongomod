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
const collectionName = 'autotests-methods-' + MongoOperations.DeleteOne;
const ctrl = new mongomod.Controller(db, collectionName);
const insertTestData = async () => {
  await ctrl.insertMany({data: [testObj, testObj2, testObj3]});
};
await insertTestData()

describe('DeleteOne. Input validation: wrong cases', () => {
  test('should throw an error if options is missing', async () => {
    await expect(ctrl.deleteOne()).rejects.toThrow();
  });

    test('should throw an error if options.filter is missing', async () => {
    await expect(ctrl.deleteOne({})).rejects.toThrow();
  });

  test('should throw an error if options.filter is not an object', async () => {
      await expect(ctrl.deleteOne({ filter: 'not an object' })).rejects.toThrow();
  });
});

describe('DeleteOne. Correct filter works', () => {
  test('should delete one document by filter  ', async () => {
    const result = await ctrl.deleteOne({
      filter: { name: testObj.name },
    });
    
    const findResult = await ctrl.findOne({ filter: { name: testObj.name } });

    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(findResult.ok).toBe(true);
    expect(findResult.data).toBeNull();
  });
});

describe('DeleteOne. Clearing collection at the end of the test', () => {
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

describe('DeleteOne. Connection closing after tests', () => {
    test('should close the connection', async () => {
        await db.disconnect();
        expect(db.isConnected).toBe(false);
    });
})