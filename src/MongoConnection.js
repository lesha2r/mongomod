import mongo from 'mongodb';

/**
 * 
 * @param {object} options link, dbName and credentials
 * @param {string} options.link URL for connection
 * @param {string} options.login mongo login
 * @param {string} options.password mongo password
 * @param {string} options.dbName database name
 * @param {boolean} options.srv srv connection
 * @param {boolean} [options.debug] enables/disables log messages
 */
class MongoConnection {
    constructor(options) {
        const missingParams = []

        if (!options.link) missingParams.push('link');
        if (!options.login) missingParams.push('login');
        if (!options.password) missingParams.push('password');
        if (!options.dbName) missingParams.push('dbName');

        if (missingParams.length > 0) {
            throw new Error(`Missing required parameters: ${missingParams.join(', ')}`)
        }

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
     * @param {function} [callback] to be invoked on success
     * @returns {Promise<{ok: boolean, details?: string, result?: object}>} result
     */
    connect(callback) {
        if (callback && typeof callback !== 'function') throw new Error('Callback must be a function');
        
        const srv = (this.options.srv === true) ? '+srv' : '';
        const mongoUrl = `mongodb${srv}://${this.login}:${this.password}@${this.link}/${this.dbName}?authSource=admin`; //&w=majority?retryWrites=true`;
        const mongoClient = new mongo.MongoClient(mongoUrl, {
            // @ts-ignore
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
                    if (this.debug) {
                        console.log(`[MongoConnection] Db connection opened: ${this.dbName}`);
                    }
                    
                    this.isConnected = true;
                    this.client = result;
                    
                    resolve({ ok: true, details: 'connection established', result: result });

                    if (callback && typeof callback === 'function') callback();
                }
            } catch (err) {
                if (this.debug) console.log(`[MongoConnection] Error connecting to ${this.dbName}:`);
                if (this.debug) console.log(err);

                this.isConnected = false;

                reject({ ok: false, details: 'error catched', error: err });
            }
        });
    }

    /**
    * Closes a connection to Mongo database
    * @param {function} [callback] to be invoked on success
    */
    async disconnect(callback) {
        await this.client.close();

        if (this.debug) console.log(`[MongoConnection] Connection closed: ${this.dbName}`);

        if (callback && typeof callback === 'function') callback();
    };

    /**
     * Passes client object
     * @returns {object} client object
     */
    passClient() {
        return this.client;
    }
}

export default MongoConnection;