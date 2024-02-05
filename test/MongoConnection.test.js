import mongomod from '../src/mongomod.js';
import dotenv from 'dotenv';
import path from 'path';

// Init dotenv module
dotenv.config({
    path: path.join(path.resolve(path.dirname('')), "/.env")
});

/**
 * @typedef TCreds 
 * @type {object}
 * @property {string} [link]
 * @property {string} [login]
 * @property {string} [password]
 * @property {string} [dbName]
 * @property {boolean} [srv]
 */

/**
 * @type {TCreds}
 */
let connectionCreds = {
    link: 'test.mongodb.net',
    login: 'login',
    password: 'pass',
    dbName: 'dbName'
};

/**
 * @type {TCreds}
 */
let connectionCredsReal = {
    link: process.env.MONGO_LINK,
    login: process.env.MONGO_USER,
    password: process.env.MONGO_PASSWORD,
    dbName: process.env.MONGO_DBNAME,
    srv: process.env.MONGO_SRV === 'true' ? true : false
};

test('connection options missing params throws an error', () => {
    expect(() => {
        const connectionCredsBroken = Object.assign({}, connectionCreds)
        delete connectionCredsBroken.link

        new mongomod.Connection(connectionCredsBroken)
    }).toThrow();

    expect(() => {
        const connectionCredsBroken = { 
            ...connectionCreds
        };
        delete connectionCredsBroken.login;
        
        new mongomod.Connection(connectionCredsBroken)
    }).toThrow();

    expect(() => {
        const connectionCredsBroken = { 
            ...connectionCreds
        };
        delete connectionCredsBroken.password;

        new mongomod.Connection(connectionCredsBroken)
    }).toThrow();

    expect(() => {
        const connectionCredsBroken = { 
            ...connectionCreds
        };
        delete connectionCredsBroken.dbName;

        new mongomod.Connection(connectionCredsBroken)
    }).toThrow();
});

test('created instance passes client object', () => {
    const connection = new mongomod.Connection(connectionCreds);

    expect(connection.passClient()).toBe(null);
});

test('connection with wrong credentials throws an error', async () => {
    try {
        const connection = new mongomod.Connection(connectionCreds);
        await connection.connect();
    } catch (e) {
        expect(e).toHaveProperty('error');
    }
}, 25000);

test('connection with correct credentials not throws an error', async () => {
    const connection = new mongomod.Connection(connectionCredsReal);

    expect(connection.isConnected).toBe(false)

    const result = await connection.connect();

    expect(result).toHaveProperty('result');
    expect(connection.isConnected).toBe(true)
}, 25000);