import mongo from 'mongodb';
export interface MongomodConnectionOptions {
    link: string;
    login: string;
    password: string;
    dbName: string;
    srv?: boolean;
    authSource?: string;
}
declare class MongoConnection {
    link: string;
    login: string;
    password: string;
    dbName: string;
    options: {
        srv: boolean;
        authSource: string;
    };
    isConnected: boolean;
    client: null | mongo.MongoClient;
    constructor(options: MongomodConnectionOptions);
    connect(callback?: Function, timeout?: number): Promise<mongo.MongoClient | null>;
    disconnect(callback?: Function): Promise<boolean>;
    getClient(): mongo.MongoClient | null;
    getDatabase(): mongo.Db;
    getDb(): mongo.Db;
    db(): mongo.Db;
    passClient(): mongo.MongoClient | null;
}
export default MongoConnection;
