import mongomod from './mongomod.js';

// * [1] Create a connection
// Create an instance
let db = new mongomod.Connection({
    link: 'cluster1.uz4a1f2.mongodb.net',
    login: 'mongoadmin',
    password: 'e5r1VHjUURc0mTFi',
    dbName: 'main',
    debug: true
});

// Establish connection
//db.connect();

// * [2] Create a schema
let userSchema = new mongomod.Schema({
    name: 'string',
}, { debug: true, strict: false });

// * Controller for direct queries
let controller = new mongomod.Controller(db, 'test');

// * [3] Create a model
let customMethods = {
    validate2: async function() { 
        let result = await this.findOne({ query: { name: 'Barney' } });
        return result;
    }
};

async function fakeRequest(id) {
    try {
        await db.connect();

        let result = await controller.findMany({ query: {}});
        console.log(result);

        let Dog = mongomod.createModel(db, 'dogs', userSchema, customMethods);

        let dog = await new Dog().get({
            _id: id,
        });

        await db.close();
        
        return dog.dataFiltered(['name', '_id']);
    } catch (err) {
        console.log(err);
    }
}

(async () => { console.log(await fakeRequest('62c973af7997f0f9fed8ab75')); })();




