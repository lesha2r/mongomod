import mongomod from '../dist/mongomod.js';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import path from 'path';

// Init dotenv module
dotenv.config({
    path: path.join(path.resolve(path.dirname('')), "/.env")
});

const TIMEOUT_MS = 25000

const credsDummy = {
    link: 'test.mongodb.net',
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

test('connection options missing params throws an error', () => {
    expect(() => {
        const connectionCredsBroken = Object.assign({}, credsDummy)
        // @ts-ignore
        delete connectionCredsBroken.link

        new mongomod.Connection(connectionCredsBroken)
    }).toThrow();

    expect(() => {
        const connectionCredsBroken = { 
            ...credsDummy
        };
        // @ts-ignore
        delete connectionCredsBroken.login;
        
        new mongomod.Connection(connectionCredsBroken)
    }).toThrow();

    expect(() => {
        const connectionCredsBroken = { 
            ...credsDummy
        };
        // @ts-ignore
        delete connectionCredsBroken.password;

        new mongomod.Connection(connectionCredsBroken)
    }).toThrow();

    expect(() => {
        const connectionCredsBroken = { 
            ...credsDummy
        };
        // @ts-ignore
        delete connectionCredsBroken.dbName;

        new mongomod.Connection(connectionCredsBroken)
    }).toThrow();
});

test('created instance passes client object', async () => {
    const connection = new mongomod.Connection(credsOK);

    expect(connection.passClient()).toBe(null);

    await connection.connect()
    const client = connection.passClient()

    expect(client).toBeInstanceOf(MongoClient)
});

test('connection with wrong credentials throws an error', async () => {
    expect(async () => {
        const connection = new mongomod.Connection(credsDummy);
        const res = await connection.connect();
    }).rejects.toThrow()
}, TIMEOUT_MS);

test('connection with correct credentials not throws an error', async () => {
    const connection = new mongomod.Connection(credsOK);

    expect(connection.isConnected).toBe(false)

    const result = await connection.connect();

    expect(result).toHaveProperty('result');
    expect(connection.isConnected).toBe(true)
}, TIMEOUT_MS);

test('connection with correct credentials succeed to connect and disconnect', async () => {
    const connection = new mongomod.Connection(credsOK);
    const result = await connection.connect();

    expect(result).toHaveProperty('result');
    expect(connection.isConnected).toBe(true)

    const discResult = await connection.disconnect()

    expect(discResult).toBe(true)
    expect(connection.isConnected).toBe(false)
}, TIMEOUT_MS);