import { MongoOperations } from '../../dist/constants/methods.js';
import mongomod from '../../dist/mongomod.js';
import { mongoCreds } from '../env.js';

const findManyTestObj = {
    name: 'Alex',
    age: 24
};

const findManyTestObj2 = {
    name: 'Alice',
    age: findManyTestObj.age
}

const db = new mongomod.Connection(mongoCreds);
await db.connect();
const collectionName = 'autotests-methods-' + MongoOperations.FindMany;
const ctrl = new mongomod.Controller(db, collectionName);
await ctrl.insertMany({data: [findManyTestObj, findManyTestObj2]});

describe('FindMany. Input validation: wrong cases', () => {
  test('should throw an error if options is missing', async () => {
    await expect(ctrl.findMany()).rejects.toThrow();
  });

  test('should throw an error if options.filter is not an object', async () => {
      await expect(ctrl.findMany({ filter: 'not an object' })).rejects.toThrow();
  });
});

describe('FindMany. Correct filter works', () => {
  test('should find more than one document in the collection using empty filter', async () => {
    const result = await ctrl.findMany({ filter: {}});

    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBeGreaterThan(1);
  });

  test('should find more than one document in the collection by filter', async () => {
    const result = await ctrl.findMany({ filter: {age: findManyTestObj.age}});

    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBeGreaterThan(1);
  });

  test('should find exact one document in the collection by filter and limit', async () => {
    const result = await ctrl.findMany({
      filter: {age: findManyTestObj.age},
      limit: 1
    });

    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBe(1);
    expect(result.data[0].name).toBe(findManyTestObj.name);
  });

  test('should find correct document in the collection by filter, limit and skip', async () => {
    const result = await ctrl.findMany({
      filter: {age: findManyTestObj.age},
      limit: 1,
      skip: 1
    });

    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBe(1);
    expect(result.data[0].name).toBe(findManyTestObj2.name);
  });

  test('shouldn\'t find any documents', async () => {
    const randomAge = Math.random();
    const options = { filter: {age: randomAge }};
    const result = await ctrl.findMany(options);

    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBe(0);
  });
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

describe('FindMany. Connection closing after tests', () => {
    test('should close the connection', async () => {
        await db.disconnect();
        expect(db.isConnected).toBe(false);
    });
})