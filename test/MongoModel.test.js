import monmodel from '../src/monmodel.js';

import dotenv from 'dotenv';
import path from 'path';

// Init dotenv module
dotenv.config({
    path: path.join(path.resolve(path.dirname('')), "/.env")
});

// Create an instance
let db = new monmodel.Connection({
    link: process.env.LINK,
    login: process.env.LOGIN,
    password: process.env.PASSWORD,
    dbName: process.env.DBNAME
});

db.connect();

let controller = new monmodel.Controller(db, 'test');

let userSchema = new monmodel.Schema({
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

let User = monmodel.createModel(db, 'test', userSchema);

test('failed schema throws an error', () => {
    let badUserSchema = {
        string: 'something'
    };

    expect(() => monmodel.createModel(db, 'test', badUserSchema)).toThrow();
});

test('good schema not throws an error', () => {
    expect(() => monmodel.createModel(db, 'test', userSchema)).not.toThrow();
});

test('setting data with a wrong type throws an error', async () => {
    await db.connect();

    let ksenia = await new User().get({ name: 'Ksenia' });

    expect(() => ksenia.set({ age: 'string' })).toThrow();
}, 30000);

test('bad request trows an error', async () => {
    await db.connect();
    try {

        let result = await new User().get({ name: new Date() });
    } catch (err) {
        expect(err).toHaveProperty('message');
    }
}, 30000);

test('real request returns data', async () => {
    await db.connect();

    let result = await new User().get({ name: 'Ksenia' });
    expect(result.modelData).toHaveProperty('age');
}, 30000);

const newName = 'record2:' + new Date();

test('creating user, inserting it, getting again returns correct user data', async () => {
    const newAge = 1024;

    await db.connect();

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
    const newAge = 2048;

    await db.connect();

    const existingUser = await new User().get({ name: newName});
    existingUser.set({ age: newAge });
    await existingUser.save();

    const gotUser = await controller.findOne({ query: { name: newName } });

    expect(gotUser.result.age).toBe(newAge);
}, 60000);

test('deleting user that was created earlier removes it from db', async () => {
    await db.connect();

    const existingUser = await new User().get({ name: newName});
    await existingUser.delete();

    try {
        await controller.findOne({ query: { name: newName } });
    } catch (e) {
        expect(e).toHaveProperty('error');
    }

    
}, 40000);

test('model clearBySchema returns coorect result #1', () => {
    let schema = {
        name: 'string',
        age: ['number', 'null'],
        friends: 'array',
        school: ['object', 'null']
    };

    let userData = {
        name: 'Barney',
        age: 6,
        friends: ['Buddy'],
        school: null
    };

    let userSchema = new monmodel.Schema(schema);
    let TestUserModel = monmodel.createModel(db, 'test', userSchema);
    let testUser = new TestUserModel().init({ ...userData, toBeCleared: 'any value' });
    
    testUser.clearBySchema();

    expect(JSON.stringify(testUser.modelData)).toBe(JSON.stringify(userData));
});

test('model clearBySchema returns coorect result #2', () => {
    let schema = {
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

    let userData = {
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

    let userSchema = new monmodel.Schema(schema);

    let TestUserModel = monmodel.createModel(db, 'test', userSchema);

    let testUser = new TestUserModel().init({ ...userData, toBeCleared: 'any value' });

    testUser.clearBySchema();

    expect(JSON.stringify(testUser.modelData)).toBe(JSON.stringify(userData));
});

test('model clearBySchema returns coorect result #2', () => {
    let schema = {
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

    let userData = {
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

    let userSchema = new monmodel.Schema(schema);

    let TestUserModel = monmodel.createModel(db, 'test', userSchema);

    let modifiedDataObj = { ...userData };

    let expectedValue = JSON.stringify(modifiedDataObj);

    modifiedDataObj.test.deep1.deep2_3.toBeDeleted = 'ok2';

    let testUser = new TestUserModel().init(modifiedDataObj);

    testUser.clearBySchema();

    expect(JSON.stringify(testUser.modelData)).toBe(expectedValue);
});

test('custom method with with reserved names throws an error', () => {
    let customs = {
        get() { return; }
    };

    expect( () => {
        let TestUserModel = monmodel.createModel(db, 'test', userSchema, customs);
    }).toThrow();
});

test('custom method works as expected', () => {
    let customs = {
        test: function() { return 'test done'; }
    };

    let TestUserModel = monmodel.createModel(db, 'test', userSchema, customs);
    let result = new TestUserModel().test();

    expect(result).toBe('test done');
});

