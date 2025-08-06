import { MongoMethods } from '../../dist/constants/methods.js';
import mongomod from '../../dist/mongomod.js';
import { mongoCreds } from '../env.js';

const testObj = {
    name: 'Sam',
    age: 24
};

const testObj2 = {
    name: 'Sue',
    age: testObj.age
}

const testObj3 = {
    name: 'Chloe',
    age: testObj.age + 1
}

const db = new mongomod.Connection(mongoCreds);
await db.connect();
const collectionName = 'autotests-methods-' + MongoMethods.Distinct;
const ctrl = new mongomod.Controller(db, collectionName);
await ctrl.insertMany({data: [testObj, testObj2, testObj3]});

describe('Distinct. Input validation: wrong cases', () => {
  test('should throw an error if options is missing', async () => {
    await expect(ctrl.distinct()).rejects.toThrow();
  });

  test('should throw an error if options.field is missing', async () => {
    await expect(ctrl.distinct({filter: {}})).rejects.toThrow();
  });

  test('should throw an error if options.field is not a string', async () => {
    await expect(ctrl.distinct({field: 123})).rejects.toThrow();
  });
});

describe('Distinct. Correct filter works', () => {
  test('correct syntax returns correct result', async () => {
    const result = await ctrl.distinct({ filter: {}, field: 'age'});

    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBe(2);
    expect(result.data).toContain(testObj.age);
    expect(result.data).toContain(testObj2.age);
    expect(result.data).toContain(testObj3.age);
  });

  test('correct syntax without filter returns correct result', async () => {
    const result = await ctrl.distinct({field: 'age'});

    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBe(2);
    expect(result.data).toContain(testObj.age);
    expect(result.data).toContain(testObj2.age);
    expect(result.data).toContain(testObj3.age);
  });

  test('correct syntax with filter returns correct result', async () => {
    const result = await ctrl.distinct({
      filter: {age: testObj.age},
      field: 'name'
    });
  
    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBe(2);
    expect(result.data[0]).toBe(testObj.name);
    expect(result.data[1]).toBe(testObj2.name);
  });
});

describe('Distinct. Clearing collection at the end of the test', () => {
  test('should clear the collection', async () => {
    const filter = {}
    await ctrl.deleteMany({filter});

    const result = await ctrl.findMany({filter});
    expect(result).toBeDefined();
    expect(result).toEqual({
      ok: true,
      data: [],
      error: null
    });
  });
});

describe('Distinct. Connection closing after tests', () => {
    test('should close the connection', async () => {
        await db.disconnect();
        expect(db.isConnected).toBe(false);
    });
})