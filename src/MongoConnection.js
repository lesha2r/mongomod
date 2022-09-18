import mongo from 'mongodb';
import MongoController from './MongoController.js';
import findOneMethod from './methods/findOne.js';

/**
 * @param { Object } options link, dbName and credentials
 * @param { String } options.link URL for connection
 * @param { String } options.login mongo login
 * @param { String } options.password mongo password
 * @param { String } options.dbName database name
 * @param { Boolean } options.srv srv connection [true / false]
 * @param { Boolean } options.debug enables/disables log messages
 * 
 */
class MongoConnection {
    constructor(options) {
        if (!options.link) throw new Error('options missing parameter: link');
        if (!options.login) throw new Error('options missing parameter: login');
        if (!options.password) throw new Error('options missing parameter: password');
        if (!options.dbName) throw new Error('options missing parameter: dbName');
        if (typeof options.srv !== 'boolean') options.srv = true;

        // Credentials and connection params
        this.link = options.link;
        this.login = options.login;
        this.password = options.password;
        this.dbName = options.dbName;
        this.debug = options.debug || false;
        this.options = {
            srv: options.srv
        };

        // Client
        this.client = null;

        // Connection status
        this.isConnected = false;
    }

    /**
     * Opens a connection to Mongo database
     * @param { Function } callback to be invoked on success
     * @returns Promise
     */
    connect(callback) {
        if (callback && typeof callback !== 'function') throw new Error('Callback must be a function');
        
        const srv = (this.options.srv === true) ? '+srv' : '';
        const mongoUrl = `mongodb${srv}://${this.login}:${this.password}@${this.link}/${this.dbName}?authSource=admin`; //&w=majority?retryWrites=true`;
        const mongoClient = new mongo.MongoClient(mongoUrl, {
            useUnifiedTopology: true,
            useNewUrlParser: true 
        });
            
        return new Promise(async (resolve, reject) => {
            if (this.client) {
                resolve({ ok: true, details: 'connection already established', result: this.client });
                return;
            }

            try {
                let result = await mongoClient.connect();
                
                if (result) {
                    if (this.debug) console.log('[MongoConnection] Connection opened');
                    
                    this.isConnected = true;
                    this.client = result;
                    
                    resolve({ ok: true, details: 'connection established', result: result });

                    if (callback && typeof callback === 'function') callback();
                }
            } catch (err) {
                if (this.debug) console.log('[MongoConnection] Error:');
                if (this.debug) console.log(err);

                this.isConnected = false;

                reject({ ok: false, details: 'error catched', error: err });
            }
        });
    }

    /**
    * Closes a connection to Mongo database
    * @param { Function } callback to be invoked on success
    */
    async disconnect(callback) {
        await this.client.close();

        if (this.debug) console.log('[MongoConnection] Connection closed');

        if (callback && typeof callback === 'function') callback();
    };

    /**
     * Passes client object
     * @returns client object
     */
    passClient() {
        return this.client;
    }
}

export default MongoConnection;