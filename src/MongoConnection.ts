import mongo from 'mongodb';

type TMongoConnectionOptions = {
    link: string
    login: string
    password: string
    dbName: string
    srv: boolean
    debug?: boolean
}

class MongoConnection {
    link: string
    login: string
    password: string
    dbName: string
    debug: boolean
    options: {
        srv: boolean
    }

    isConnected: boolean
    client: null | mongo.MongoClient

    constructor(options: TMongoConnectionOptions) {
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

    // Opens a connection to Mongo database
    connect(callback?: Function): Promise<{ok: boolean, details: string, result: mongo.MongoClient}> {
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

    // Closes a connection to Mongo database
    async disconnect(callback?: Function) {
        if (this.client) {
            await this.client.close();
        }

        if (this.debug) console.log(`[MongoConnection] Connection closed: ${this.dbName}`);

        if (callback && typeof callback === 'function') callback();
    };

    // Passes client object
    passClient() {
        return this.client;
    }
}

export default MongoConnection;