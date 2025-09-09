import mongo from 'mongodb';
export interface MongomodConnectionOptions {
    link: string;
    login: string;
    password: string;
    dbName: string;
    srv: boolean;
}
declare class MongoConnection {
    link: string;
    login: string;
    password: string;
    dbName: string;
    options: {
        srv: boolean;
    };
    isConnected: boolean;
    client: null | mongo.MongoClient;
    constructor(options: MongomodConnectionOptions);
    connect(callback?: Function, timeout?: number): Promise<mongo.MongoClient | null>;
    disconnect(callback?: Function): Promise<boolean>;
    passClient(): any;
    getDatabase(): any;
    getDb(): any;
    db(): any;
}
export default MongoConnection;
