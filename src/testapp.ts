import mongomod from '../src/mongomod.js';
import dotenv from 'dotenv';
import path from 'path';

// Init dotenv module
dotenv.config({
    path: path.join(path.resolve(path.dirname('')), "/.env")
});

let connectionCredsReal = {
    link: String(process.env.MONGO_LINK),
    login: String(process.env.MONGO_USER),
    password: String(process.env.MONGO_PASSWORD),
    dbName: 'core',
    srv: process.env.MONGO_SRV === 'true' ? true : false
};

const start = async () => {
    console.log('start')
    const connection = new mongomod.Connection(connectionCredsReal);
    console.log('connection init')
    await connection.connect();
    console.log('connected extablished')
    const controller = new mongomod.Controller(connection, 'goods');
    console.log('controller created')
    const items = await controller.findMany({
        query: { workspace: '6327fade92ee975b56a6f1ec'}
    })

    const checkResult = await controller.ensureIndex([
        {keys: ['workspace']},
        {keys: ['workspace', 'shopNid', 'categoryWb', 'categoryCustom']},
        // {keys: ['title']}
    ])
    console.log(checkResult)
}

setTimeout(start, 1000)