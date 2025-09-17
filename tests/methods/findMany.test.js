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

describe('FindMany. Testing sort and project parameters', () => {
  beforeAll(async () => {
    // Insert test data with more variety for sort testing
    const testData = [
      { name: 'Alice', age: 25, city: 'New York' },
      { name: 'Bob', age: 30, city: 'Los Angeles' },
      { name: 'Charlie', age: 20, city: 'Chicago' },
      { name: 'Diana', age: 35, city: 'Miami' }
    ];
    await ctrl.insertMany({data: testData});
  });

  test('should sort documents by age ascending', async () => {
    const result = await ctrl.findMany({ 
      filter: {}, 
      sort: { age: 1 },
      limit: 10 
    });

    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBeGreaterThan(3);
    
    // Check if sorted by age ascending
    for (let i = 1; i < result.data.length; i++) {
      expect(result.data[i].age).toBeGreaterThanOrEqual(result.data[i-1].age);
    }
  });

  test('should sort documents by age descending', async () => {
    const result = await ctrl.findMany({ 
      filter: {}, 
      sort: { age: -1 },
      limit: 10 
    });

    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBeGreaterThan(3);
    
    // Check if sorted by age descending
    for (let i = 1; i < result.data.length; i++) {
      expect(result.data[i].age).toBeLessThanOrEqual(result.data[i-1].age);
    }
  });

  test('should project only specific fields', async () => {
    const result = await ctrl.findMany({ 
      filter: { name: 'Alice' }, 
      project: { name: 1, age: 1 }
    });

    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBeGreaterThan(0);
    
    // Check that only projected fields are present (plus _id which is included by default)
    const doc = result.data[0];
    expect(doc.name).toBeDefined();
    expect(doc.age).toBeDefined();
    expect(doc._id).toBeDefined();
    expect(doc.city).toBeUndefined();
  });

  test('should project excluding _id field', async () => {
    const result = await ctrl.findMany({ 
      filter: { name: 'Bob' }, 
      project: { name: 1, age: 1, _id: 0 }
    });

    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBeGreaterThan(0);
    
    // Check that _id is excluded
    const doc = result.data[0];
    expect(doc.name).toBeDefined();
    expect(doc.age).toBeDefined();
    expect(doc._id).toBeUndefined();
    expect(doc.city).toBeUndefined();
  });

  test('should combine sort and project parameters', async () => {
    const result = await ctrl.findMany({ 
      filter: {}, 
      sort: { age: 1 },
      project: { name: 1, age: 1, _id: 0 },
      limit: 3
    });

    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBeLessThanOrEqual(3);
    
    // Check sorting
    for (let i = 1; i < result.data.length; i++) {
      expect(result.data[i].age).toBeGreaterThanOrEqual(result.data[i-1].age);
    }
    
    // Check projection
    result.data.forEach(doc => {
      expect(doc.name).toBeDefined();
      expect(doc.age).toBeDefined();
      expect(doc._id).toBeUndefined();
      expect(doc.city).toBeUndefined();
    });
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