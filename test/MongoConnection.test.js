import { jest } from '@jest/globals';
import mongomod from '../dist/mongomod.js';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import path from 'path';
import { link } from 'fs';

// Init dotenv module
dotenv.config({
    path: path.join(path.resolve(path.dirname('')), "/.env")
});

const TIMEOUT_MS = 25000

const credsDummy = {
    link: 'test.dummy.link:27888',
    login: 'login',
    password: 'pass',
    dbName: 'dbName'
};

const credsOK = {
    link: process.env.MONGO_LINK,
    login: process.env.MONGO_USER,
    password: process.env.MONGO_PASSWORD,
    dbName: process.env.MONGO_DBNAME,
    srv: process.env.MONGO_SRV === 'true' ? true : false
};

// describe('MongoConnection validation', () => {
//     test('Missing required params throws', () => {
//         expect(() => {
//             const connectionCredsBroken = { ...credsOK };
//             delete connectionCredsBroken.link;

//             new mongomod.Connection(connectionCredsBroken);
//         }).toThrow();

//         expect(() => {
//             const connectionCredsBroken = { ...credsOK };
//             delete connectionCredsBroken.login;

//             new mongomod.Connection(connectionCredsBroken);
//         }).toThrow();

//         expect(() => {
//             const connectionCredsBroken = { ...credsOK };
//             delete connectionCredsBroken.password;

//             new mongomod.Connection(connectionCredsBroken);
//         }).toThrow();

//         expect(() => {
//             const connectionCredsBroken = { ...credsOK };
//             delete connectionCredsBroken.dbName;

//             new mongomod.Connection(connectionCredsBroken);
//         }).toThrow();
//     })

//     test('Vallid params does not throw', () => {
//         expect(() => {
//             new mongomod.Connection(credsOK);
//         }).not.toThrow();
//     })
// })

describe('MongoConnection.connect', () => {
    test('Connects to MongoDB with valid credentials', async () => {
        const db = new mongomod.Connection(credsOK);
        await db.connect()

        expect(db.client).toBeInstanceOf(MongoClient);
        expect(db.isConnected).toBe(true);

        await db.disconnect();
    });

    test('Connection to MongoDB with invalid credentials fails', async () => {
        const db = new mongomod.Connection({
            ...credsOK,
            login: credsDummy.login,
        });

        await expect(db.connect()).rejects.toThrow();
    });

    test('Connect callback fails validation if not a function', async () => {
        const db = new mongomod.Connection(credsOK);

        expect(db.connect('not a function')).rejects.toThrow();
        await db.disconnect()
    });

    test('Connect callback is called on successful connection', async () => {
        const db = new mongomod.Connection(credsOK);
        const callback = jest.fn();

        await db.connect(callback);

        expect(callback).toHaveBeenCalled();
        expect(db.isConnected).toBe(true);

        await db.disconnect();
    });
})

describe('MongoConnection.disconnect', () => {
    test('Disconnects from MongoDB', async () => {
        const db = new mongomod.Connection(credsOK);
        await db.connect();

        expect(db.isConnected).toBe(true);

        await db.disconnect();

        expect(db.isConnected).toBe(false);
        expect(db.client).toBeNull();
    });

    test('Disconnect does not throw if not connected', async () => {
        const db = new mongomod.Connection(credsOK);
        await expect(db.disconnect()).resolves.not.toThrow();
    });
});
