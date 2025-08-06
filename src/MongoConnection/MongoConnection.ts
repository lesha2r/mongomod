import mongo from 'mongodb';
import { MmConnectionError } from '../errors/index.js';
import { MmConnectionErrCodes, MmConnectionErrMsgs } from '../constants/connection.js';
import { validateConnectCallback, validateOptions } from '../utils/connection.js';

export interface MongomodConnectionOptions {
    link: string
    login: string
    password: string
    dbName: string
    srv: boolean
}

class MongoConnection {
    link: string
    login: string
    password: string
    dbName: string
    options: {
        srv: boolean
    }
    isConnected: boolean
    client: null | mongo.MongoClient

    constructor(options: MongomodConnectionOptions) {
        validateOptions(options);

        const optionsHandled = {...options};

        // Set defaults
        if (options.srv === undefined) {
            optionsHandled.srv = false;
        }

        // Credentials and connection params
        this.link = options.link;
        this.login = options.login;
        this.password = options.password;
        this.dbName = options?.dbName || '';
        this.options = {
            srv: options.srv
        };

        this.client = null;
        this.isConnected = false;
    }

    // Opens a connection
    async connect(callback?: Function, timeout?: number): Promise<mongo.MongoClient | null> {    
        validateConnectCallback(callback)
        
        const srv = (this.options.srv === true) ? '+srv' : '';
        const mongoUrl = `mongodb${srv}://${this.login}:${this.password}@${this.link}/${this.dbName}?authSource=admin`; //&w=majority?retryWrites=true`;
        const mongoClient = new mongo.MongoClient(mongoUrl);

        if (this.client) return this.client;

        let timeoutId: NodeJS.Timeout | null = null;

        try {
            timeoutId = setTimeout(() => {
                if (this.isConnected) return;
                
                throw new MmConnectionError({
                    code: MmConnectionErrCodes.ConnectionTimeout,
                    message: MmConnectionErrMsgs.ConnectionTimeout,
                    dbName: this.dbName || null
                });
            }, timeout || 30000);

            const result = await mongoClient.connect();
            
            this.isConnected = true;
            this.client = result;

            if (timeoutId) clearTimeout(timeoutId);
            if (callback && typeof callback === 'function') callback();

            return this.client
        } catch (err: any) {
            if (timeoutId) clearTimeout(timeoutId);

            this.isConnected = false;
            this.client = null;

            throw new MmConnectionError({
                code: MmConnectionErrCodes.ConnectionFailed,
                message: MmConnectionErrMsgs.ConnectionFailed,
                dbName: this.dbName || null,
                originalError: err
            });
        }
    }

    // Closes a connection
    async disconnect(callback?: Function) {
        validateConnectCallback(callback)

        try {
            if (this.client) await this.client.close();
            if (callback && typeof callback === 'function') callback();
            
            this.isConnected = false
            this.client = null;

            return true
        } catch (err) {
            throw new MmConnectionError({
                code: MmConnectionErrCodes.CloseConnectionFailed,
                message: MmConnectionErrMsgs.CloseConnectionFailed,
                dbName: this.dbName || null,
                originalError: err
            });
        }
    };

    // Passes client object
    passClient() {
        return this.client;
    }

    // Returns database instance
    getDatabase() {
        return this.client!.db(this.dbName);
    }

    // Aliases:
    // getDatabase alias
    getDb() {
        return this.getDatabase();
    }
    db() {
        return this.getDatabase();
    }
}

export default MongoConnection;