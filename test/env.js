import path from 'path';
import dotenv from 'dotenv';

// Init dotenv module
dotenv.config({
    path: path.join(path.resolve(path.dirname('')), "/.env")
});

export const mongoCreds = {
    link: process.env.MONGO_LINK,
    login: process.env.MONGO_USER,
    password: process.env.MONGO_PASSWORD,
    dbName: process.env.MONGO_DBNAME,
    srv: process.env.MONGO_SRV === 'true' ? true : false
}