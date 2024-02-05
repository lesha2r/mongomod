import mongomod from "../src/mongomod.js";
import dotenv from 'dotenv';
import path from 'path';

// Init dotenv module
dotenv.config({
    path: path.join(path.resolve(path.dirname('')), "/.env")
});

const checkMethods = [
    'aggregate',
    'count',
    'deleteMany',
    'deleteOne',
    'findMany',
    'findOne',
    'insertMany',
    'insertOne',
    'updateMany',
    'updateOne'
];

// Create an instance
const connectionCredsReal = {
    link: process.env.MONGO_LINK,
    login: process.env.MONGO_USER,
    password: process.env.MONGO_PASSWORD,
    dbName: process.env.MONGO_DBNAME,
    srv: process.env.MONGO_SRV === 'true' ? true : false
};

const db = new mongomod.Connection(connectionCredsReal)
const controller = new mongomod.Controller(db, 'test');

test('new mongo controller has all methods', () => {
    let result = checkMethods.every( key => typeof controller[key] === 'function');

    expect(result).toBe(true);
});