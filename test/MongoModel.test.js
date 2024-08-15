import mongomod from '../dist/mongomod.js';

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
    path: path.join(path.resolve(path.dirname('')), "/.env")
});

const db = new mongomod.Connection({
    link: process.env.MONGO_LINK,
    login: process.env.MONGO_USER,
    password: process.env.MONGO_PASSWORD,
    dbName: process.env.MONGO_DBNAME,
    srv: false,
    debug: true
});

const controller = new mongomod.Controller(db, 'test');

const userSchema = new mongomod.Schema({
    name: 'string',
    age: 'number',
    address: {
        city: 'string',
        coordinates: {
            x: 'number',
            y: 'number'
        }
    }
});

const User = mongomod.createModel(db, 'test', userSchema);

test('failed schema throws an error', () => {
    const badUserSchema = {
        string: 'something'
    };

    expect(() => mongomod.createModel(db, 'test', badUserSchema)).toThrow();
});

test('good schema not throws an error', () => {
    expect(() => mongomod.createModel(db, 'test', userSchema)).not.toThrow();
});

test('good schema item inserted', async () => {
    if (!db.isConnected) await db.connect()

        const newUser = await new User().init({
        name: "Ksenia",
        age: 5,
        address: {
            city: "Moscow",
            coordinates: {
                x: 111,
                y: 222
            }
        }
    })

    await newUser.save(true)

    expect(newUser.modelData).toHaveProperty('_id');
}, 55000);

test('setting data with a wrong type throws an error', async () => {
    if (!db.isConnected) await db.connect();

    const ksenia = await new User().get({ name: 'Ksenia' });

    expect(() => ksenia.set({ age: 'string' })).toThrow();
}, 30000);

test('bad request trows an error', async () => {
    await db.connect();

    try {

        const result = await new User().get({ name: new Date() });
    } catch (err) {
        expect(err).toHaveProperty('message');
    }
}, 30000);

test('real request returns data', async () => {
    if (!db.isConnected) await db.connect();

    const result = await new User().get({ name: 'Ksenia' });
    expect(result.modelData).toHaveProperty('age');
}, 30000);

const newName = 'record2:' + new Date();

test('creating user, inserting it, getting again returns correct user data', async () => {
    if (!db.isConnected) await db.connect();

    const newAge = 1024;

    const newbie = new User().init({
        name: newName,
        age: newAge,
        address: {
            city: 'Moscow',
            coordinates: {
                x: 1,
                y: 2
            }
        }
    });

    await newbie.insert();

    const gotUser = await controller.findOne({ query: { name: newName } });

    expect(gotUser.result.age).toBe(newAge);
}, 30000);

test('getting user, changing it, saving it, getting again returns coorect user data', async () => {
    if (!db.isConnected) await db.connect();

    const newAge = 2048;
    const existingUser = await new User().get({ name: newName});
    existingUser.set({ age: newAge });
    await existingUser.save();

    const gotUser = await controller.findOne({ query: { name: newName } });

    expect(gotUser.result.age).toBe(newAge);
}, 60000);

test('deleting user that was created earlier removes it from db', async () => {
    if (!db.isConnected) await db.connect();

    const existingUser = await new User().get({ name: newName});
    await existingUser.delete();

    try {
        await controller.findOne({ query: { name: newName } });
    } catch (e) {
        expect(e).toHaveProperty('error');
    }
}, 40000);

test('model clearBySchema returns coorect result #1', () => {
    const schema = {
        name: 'string',
        age: ['number', 'null'],
        friends: 'array',
        school: ['object', 'null']
    };

    const userData = {
        name: 'Barney',
        age: 6,
        friends: ['Buddy'],
        school: null
    };

    const userSchema = new mongomod.Schema(schema);
    const TestUserModel = mongomod.createModel(db, 'test', userSchema);
    const testUser = new TestUserModel().init({ ...userData, toBeCleared: 'any value' });
    
    testUser.clearBySchema();

    expect(JSON.stringify(testUser.modelData)).toBe(JSON.stringify(userData));
});

test('model clearBySchema returns coorect result #2', () => {
    const schema = {
        name: 'string',
        age: ['number', 'null'],
        address: {
            city: 'string',
            coordinates: {
                x: 'number',
                y: 'number'
            }
        },
        friends: 'array',
        school: ['object', 'null']
    };

    const userData = {
        name: 'Barney',
        age: 6,
        address: {
            city: 'Khatminki',
            coordinates: {
                x: 3,
                y: 6
            }
        },
        friends: ['Buddy'],
        school: null
    };

    const userSchema = new mongomod.Schema(schema);

    const TestUserModel = mongomod.createModel(db, 'test', userSchema);

    const testUser = new TestUserModel().init({ ...userData, toBeCleared: 'any value' });

    testUser.clearBySchema();

    expect(JSON.stringify(testUser.modelData)).toBe(JSON.stringify(userData));
});

test('model clearBySchema returns coorect result #2', () => {
    const schema = {
        name: 'string',
        age: ['number', 'null'],
        address: {
            city: 'string',
            coordinates: {
                x: 'number',
                y: 'number'
            }
        },
        friends: 'array',
        school: ['object', 'null'],
        test: { 
            deep1: { 
                deep2_1: {
                    deep3_1: 'string',
                    deep3_2: 'string',
                },
                deep2_2: {
                    deep4_1: 'string',
                    deep4_2: 'string',
                },
                deep2_3: {
                    deep5_1: 'string',
                    deep5_2: 'string',
                }
            }
        }
    };

    const userData = {
        name: 'Barney',
        age: 6,
        address: {
            city: 'Khatminki',
            coordinates: {
                x: 3,
                y: 6
            }
        },
        friends: ['Buddy'],
        school: null,
        test: { 
            deep1: { 
                deep2_1: {
                    deep3_1: 'a',
                    deep3_2: 'b',
                },
                deep2_2: {
                    deep4_1: 'c',
                    deep4_2: 'd',
                },
                deep2_3: {
                    deep5_1: 'e',
                    deep5_2: 'f',
                }
            }
        }
    };

    const userSchema = new mongomod.Schema(schema);
    const TestUserModel = mongomod.createModel(db, 'test', userSchema);
    const modifiedDataObj = { ...userData };
    const expectedValue = JSON.stringify(modifiedDataObj);

    modifiedDataObj.test.deep1.deep2_3.toBeDeleted = 'ok2';

    const testUser = new TestUserModel().init(modifiedDataObj);

    testUser.clearBySchema();

    expect(JSON.stringify(testUser.modelData)).toBe(expectedValue);
});

test('custom method with with reserved names throws an error', () => {
    const customs = {
        get() { return; }
    };

    expect( () => {
        const TestUserModel = mongomod.createModel(db, 'test', userSchema, customs);
    }).toThrow();
});

test('custom method works as expected', () => {
    const customs = {
        test: function() { return 'test done'; }
    };

    const TestUserModel = mongomod.createModel(db, 'test', userSchema, customs);
    const result = new TestUserModel().test();

    expect(result).toBe('test done');
});

