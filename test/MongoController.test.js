import MongoController from "../src/MongoController.js";
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
let db = new mongomod.Connection({
    link: process.env.LINK,
    login: process.env.LOGIN,
    password: process.env.PASSWORD,
    dbName: process.env.DBNAME
});

//db.connect();

let controller = new mongomod.Controller(db, 'test');

test('new mongo controller has all methods', () => {
    let result = checkMethods.every( key => typeof controller[key] === 'function');

    expect(result).toBe(true);
});