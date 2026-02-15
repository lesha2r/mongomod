import path from 'path';
import dotenv from 'dotenv';

// Init dotenv module
dotenv.config({
    path: path.join(path.resolve(path.dirname('')), "/.env")
});

export const mongoCreds = {
    link: process.env.MONGO_LINK as string,
    login: process.env.MONGO_USER as string,
    password: process.env.MONGO_PASSWORD as string,
    dbName: process.env.MONGO_DBNAME as string,
    srv: process.env.MONGO_SRV === 'true' ? true : false
}
