import mongo from 'mongodb';
import { MmConnectionError } from '../errors/index.js';
import { MmConnectionErrCodes, MmConnectionErrMsgs } from '../constants/connection.js';
import { validateConnectCallback, validateOptions } from '../utils/connection.js';
class MongoConnection {
    link;
    login;
    password;
    dbName;
    options;
    isConnected;
    client;
    constructor(options) {
        validateOptions(options);
        const optionsHandled = { ...options };
        if (options.srv === undefined) {
            optionsHandled.srv = false;
        }
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
    async connect(callback, timeout) {
        validateConnectCallback(callback);
        const srv = (this.options.srv === true) ? '+srv' : '';
        const mongoUrl = `mongodb${srv}://${this.login}:${this.password}@${this.link}/${this.dbName}?authSource=admin`;
        const mongoClient = new mongo.MongoClient(mongoUrl);
        if (this.client)
            return this.client;
        let timeoutId = null;
        try {
            timeoutId = setTimeout(() => {
                if (this.isConnected)
                    return;
                throw new MmConnectionError({
                    code: MmConnectionErrCodes.ConnectionTimeout,
                    message: MmConnectionErrMsgs.ConnectionTimeout,
                    dbName: this.dbName || null
                });
            }, timeout || 30000);
            const result = await mongoClient.connect();
            this.isConnected = true;
            this.client = result;
            if (timeoutId)
                clearTimeout(timeoutId);
            if (callback && typeof callback === 'function')
                callback();
            return this.client;
        }
        catch (err) {
            if (timeoutId)
                clearTimeout(timeoutId);
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
    async disconnect(callback) {
        validateConnectCallback(callback);
        try {
            if (this.client)
                await this.client.close();
            if (callback && typeof callback === 'function')
                callback();
            this.isConnected = false;
            this.client = null;
            return true;
        }
        catch (err) {
            throw new MmConnectionError({
                code: MmConnectionErrCodes.CloseConnectionFailed,
                message: MmConnectionErrMsgs.CloseConnectionFailed,
                dbName: this.dbName || null,
                originalError: err
            });
        }
    }
    ;
    passClient() {
        return this.client;
    }
    getDatabase() {
        return this.client.db(this.dbName);
    }
    getDb() {
        return this.getDatabase();
    }
    db() {
        return this.getDatabase();
    }
}
export default MongoConnection;
