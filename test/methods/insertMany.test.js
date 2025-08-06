import { MongoMethods } from '../../dist/constants/methods.js';
import mongomod from '../../dist/mongomod.js';
import { mongoCreds } from '../env.js';

const db = new mongomod.Connection(mongoCreds);
await db.connect();
const collectionName = 'autotests-methods-' + MongoMethods.InsertMany;
const ctrl = new mongomod.Controller(db, collectionName);

describe('InsertMany. Input validation: wrong cases', () => {
  test('should throw an error if data is missing', async () => {
    await expect(ctrl.insertMany()).rejects.toThrow();
  });

  test('should throw an error if input is empty', async () => {
    await expect(ctrl.insertMany({})).rejects.toThrow();
  });
  
  test('should throw an error if input.data is an empty object', async () => {
    await expect(ctrl.insertMany({data: []})).rejects.toThrow();
  });

  test('should throw an error if data is an array', async () => {
    await expect(ctrl.insertMany([])).rejects.toThrow();
  });
});

describe('InsertMany. Correct document and input', () => {
  test('should insert one document into the collection', async () => {
    const dataToInsert = [
      { name: 'Xenia', age: 6}
    ];

    const result = await ctrl.insertMany({data: dataToInsert});

    expect(result.ok).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.data.length).toBe(dataToInsert.length);
    expect(result.data[0]._id).toBeDefined();
    expect(result.data[0].name).toBe(dataToInsert[0].name);
    expect(result.data[0].age).toBe(dataToInsert[0].age);
  });

  test('should insert many documents into the collection', async () => {
    const dataToInsert = [
      { name: 'Alice', age: 32 },
      { name: 'Bob', age: 31 },
      { name: 'Charlie', age: 29 },
      { name: 'Diana', age: 28 }
    ]

    const result = await ctrl.insertMany({data: dataToInsert});

    expect(result.ok).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.data.length).toBe(dataToInsert.length);
    expect(result.data[0]._id).toBeDefined();
    expect(result.data[0].name).toBe(dataToInsert[0].name);
    expect(result.data[0].age).toBe(dataToInsert[0].age);
  });
});

describe('InsertMany. Clearing collection at the end of the test', () => {
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

describe('InsertMany. Connection closing after tests', () => {
    test('should close the connection', async () => {
        await db.disconnect();
        expect(db.isConnected).toBe(false);
    });
})