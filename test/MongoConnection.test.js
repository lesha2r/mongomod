import monmodel from '../src/monmodel.js';
import dotenv from 'dotenv';
import path from 'path';

// Init dotenv module
dotenv.config({
    path: path.join(path.resolve(path.dirname('')), "/.env")
});

let connectionCreds = {
    link: 'test.mongodb.net',
    login: 'login',
    password: 'pass',
    dbName: 'dbName'
};

let connectionCredsReal = {
    link: process.env.LINK,
    login: process.env.LOGIN,
    password: process.env.PASSWORD,
    dbName: process.env.DBNAME
};

test('connection options missing link throws an error', () => {
    let connectionCredsBroken = { 
        ...connectionCreds
    };

    delete connectionCredsBroken.link;

    expect(() => monmodel.Connection(connectionCredsBroken)).toThrow();
});

test('connection options missing login throws an error', () => {
    let connectionCredsBroken = { 
        ...connectionCreds
    };

    delete connectionCredsBroken.login;

    expect(() => monmodel.Connection(connectionCredsBroken)).toThrow();
});

test('connection options missing password throws an error', () => {
    let connectionCredsBroken = { 
        ...connectionCreds
    };

    delete connectionCredsBroken.password;

    expect(() => monmodel.Connection(connectionCredsBroken)).toThrow();
});

test('connection options missing dbName throws an error', () => {
    let connectionCredsBroken = { 
        ...connectionCreds
    };

    delete connectionCredsBroken.dbName;

    expect(() => monmodel.Connection(connectionCredsBroken)).toThrow();
});

test('created instance passes client object', () => {
    let connection = new monmodel.Connection(connectionCreds);

    expect(connection.passClient()).toBe(null);
});

test('connection with wrong credentials throws an error', async () => {
    let connection = new monmodel.Connection(connectionCreds);
    //const conntectionResult = await connection.connect();
    try {
        await connection.connect();
    } catch (e) {
        expect(e).toHaveProperty('error');
    }
}, 25000);

test('connection with correct credentials not throws an error', async () => {
    let connection = new monmodel.Connection(connectionCredsReal);
    //const conntectionResult = await connection.connect();

    let result = await connection.connect();
    expect(result).toHaveProperty('result');

}, 25000);