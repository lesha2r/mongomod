import { MongoMethods } from '../../dist/constants/methods.js';
import mongomod from '../../dist/mongomod.js';
import { mongoCreds } from '../env.js';

const db = new mongomod.Connection(mongoCreds);
await db.connect();
const collectionName = 'autotests-methods-' + MongoMethods.InsertOne;
const ctrl = new mongomod.Controller(db, collectionName);

describe('InsertOne. Input validation: wrong cases', () => {
  test('should throw an error if data is missing', async () => {
    await expect(ctrl.insertOne()).rejects.toThrow();
  });

  test('should throw an error if data is empty', async () => {
    await expect(ctrl.insertOne({})).rejects.toThrow();
  }); 

  test('should throw an error if data is an array', async () => {
    await expect(ctrl.insertOne([])).rejects.toThrow();
  });
});

describe('InsertOne. Correct document and input', () => {
  test('should insert a document into the collection by data as input', async () => {
    const data = { name: 'John Doe', age: 30};
    const result = await ctrl.insertOne(data);

    expect(result.ok).toBeDefined();
    expect(result.data._id).toBeDefined();
    expect(result.data.name).toBe(data.name);
    expect(result.data.age).toBe(data.age);
  });
});

describe('InsertOne. Clearing collection at the end of the test', () => {
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

describe('InsertOne. Connection closing after tests', () => {
    test('should close the connection', async () => {
        await db.disconnect();
        expect(db.isConnected).toBe(false);
    });
})