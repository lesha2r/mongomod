import mongomod from '../dist/mongomod.js';
import path from 'path';
import dotenv from 'dotenv';
import MongoSchema from '../dist/MongoSchema/MongoSchema.js';
import MongoController from '../dist/MongoController/MongoController.js';

// Init dotenv module
dotenv.config({
    path: path.join(path.resolve(path.dirname('')), "/.env")
});

const TEST_COLLECTION = 'autotests-mongomodel'

const mongoCreds = {
    link: process.env.MONGO_LINK,
    login: process.env.MONGO_USER,
    password: process.env.MONGO_PASSWORD,
    dbName: process.env.MONGO_DBNAME,
    srv: process.env.MONGO_SRV === 'true' ? true : false
}

const db = new mongomod.Connection(mongoCreds);
await db.connect()

describe('Before start', () => {
    test('Clearing the collection before start', async () => {
        const collection = new MongoController(db, TEST_COLLECTION)
        const result = await collection.deleteMany({filter: {}})
        expect(result.ok).toBe(true)
    })
})

describe('MongoModel creation: validation', () => {
    test('should throw if no options provided', () => {
        expect(() => mongomod.createModel({})).toThrow()
    })

    test('should throw if no options provided exc db', () => {
        expect(() => mongomod.createModel({db})).toThrow()
    })

    test('should throw if no options provided exc db, schema', () => {
        const schema = new MongoSchema({ name: {type: String} })
        const options = {db, schema}
        expect(() => mongomod.createModel(options)).toThrow()
    })

    test('shouldn\'t throw if minimally required options are provided', () => {
        const options = {db, collection: TEST_COLLECTION}
        expect(() => mongomod.createModel(options)).not.toThrow()
    })

    test('shouldn\'t throw if minimally required options + schema are provided', () => {
        const schema = new MongoSchema({ name: {type: String} })
        const options = {db, collection: TEST_COLLECTION, schema}
        expect(() => {
            const User = mongomod.createModel(options)
        }).not.toThrow()
    })

    test('shouldn\'t throw if all options are provided', () => {
        const schema = new MongoSchema({ name: {type: String} })
        const customMethods = {hello: "world"}
        const options = {db, collection: TEST_COLLECTION, schema, customMethods}
        expect(() => {
            const User = mongomod.createModel(options)
        }).not.toThrow()
    })

    test('should throw if customMethod is not an object', () => {
        const schema = new MongoSchema({ name: {type: String} })
        const customMethods = '{hello: "world"}'
        const options = {db, collection: TEST_COLLECTION, schema, customs: customMethods}
        expect(() => {
            const User = mongomod.createModel(options)
        }).toThrow()
    })
})

const schema = new MongoSchema({ name: {type: String}, age: {type: Number} })
const customMethods = {hello: ()=> console.log('hi')}
const options = {db, collection: TEST_COLLECTION, schema, customs: customMethods}
const User = mongomod.createModel(options)

describe('MongoModel creation: constructing models instance', () => {
    test('Model created by the constructor works as expected', () => {
        const user = new User()
        expect(user.modelData).toBe(null)
    })

    test('Model created by the constructor fails the validation is one of the field is missing', () => {
        const data = { name: "John"}
        expect(() => new User().init(data)).toThrow()
    })

    test('Model created by the constructor works as expected', () => {
        const data = { name: "John", age: 30}
        const user = new User().init(data)
        expect(user.modelData).toEqual(data)
    })
})

describe('Mongomodel: working with model instance', () => {
    test('model.insert() inserts new document to collection', async () => {
        const randomId = Math.random()
        const data = { name: "John", age: 30, randomId}
        const user = new User().init(data)
        await user.insert()

        const result = await User.findOne({filter: {randomId}})
        expect(result.data).toEqual(data)
    })

    test('model.save() throws if document is new', async () => {
        expect(async () => {
            const randomId = Math.random()
            const data = { name: "Nataly", age: 35, randomId}
            const user = new User().init(data)
            await user.save()
        }).rejects.toThrow()
    })

    test('model.save(true) inserts new document to collection', async () => {
        const randomId = Math.random()
        const data = { name: "Nataly", age: 35, randomId}
        const user = new User().init(data)
        await user.save(true)

        const result = await User.findOne({filter: {randomId}})
        expect(result.data).toEqual(data)
    })

    test('model.set updates modelData but does not update remote document', async () => {
        const data = { name: "Julie", age: 34}
        const user = new User().init(data)
        await user.save(true)

        user.set({age: data.age + 1})

        expect(user.modelData.age).toBe(data.age + 1)

        const result = await User.findOne({filter: {name: 'Julie'}})
        expect(result.data.age).toEqual(data.age)
    })

    test('model.set updates modelData and model.save() updates remote document', async () => {
        const data = { name: "Ann", age: 24}
        const user = new User().init(data)
        await user.save(true)

        user.set({age: data.age + 1})
        expect(user.modelData.age).toBe(data.age + 1)

        await user.save()

        const result = await User.findOne({filter: {name: data.name}})
        expect(result.data.age).toEqual(data.age + 1)
    })

    test('model.get fetches required document by filter', async () => {
        const name = 'Ann'
        const user = await new User().get({name})
        expect(user.modelData.name).toBe(name)
    })

    test('model.get() throws if document does not exist', async () => {
        const unexistingName = 'VickiChristinaBarcelona'
        const user = await new User()

        expect(async () => await user.get({name: unexistingName})).rejects.toThrow()
    })

    test('model.data() returns modelData object', () => {
        const user = new User().init({
            name: "Barney",
            age: 39
        })

        expect(user.data()).toEqual(user.modelData)
    })

    test('model.delete() deletes document in collection', async() => {
        const data = { name: "John Wick", age: 0}
        const user = await new User().init(data)
        await user.save(true)
        expect(user.data()).toEqual(data)

        await user.delete()
        const found = await User.findOne({filter: data})
        expect(found.data).toEqual(null)
    })
})

describe('MongoModel: using custom methods', () => {
    const schema = new MongoSchema({ name: {type: String}, age: {type: Number} })
    const customMethods = {hello() { return `Hi, ${this.data().name}`}}
    const options = {db, collection: TEST_COLLECTION, schema, customs: customMethods}
    const User = mongomod.createModel(options)

    test('custom method works as expected and has access to modelData', () => {
        const user = new User().init({name: 'Tony', age: 56})
        expect(user.hello()).toBe('Hi, Tony')
    })
})

describe('MongoModel: using subscribers', () => {
    test('Unknown event name does not throw', () => {
        expect(() => User.subscribe('unexisting', () => {})).not.toThrow()
    })

    test('onCreated subscriber triggers when document is inserted', async() => {
        let createdAge = 0
        User.subscribe('created', (newV) => createdAge = newV.age)
        const user = new User().init({name: 'Tony', age: 56})
        await user.insert()
        expect(createdAge).toBe(56)
    })

    test('onUpdated subscriber triggers when document is save', async() => {
        const data = {name: 'Vitto', age: 57}
        const ages = []

        User.subscribe('updated', (newV, oldV) => {
            ages.push(newV.age)
            ages.push(oldV.age)
        })

        const user = new User().init(data)
        await user.insert()
        user.set({age: data.age + 1})
        await user.save()

        expect(ages).toEqual([data.age + 1, data.age])
    })

    test('onDeleted subscriber triggers when document is deleted', async() => {
        const data = {name: 'Carmella', age: 54}
        let dataBefore
        let dataAfter

        User.subscribe('deleted', (newV, oldV) => {
            dataBefore = {name: oldV.name, age: oldV.age}
            dataAfter = newV
        })

        const user = new User().init(data)
        await user.insert()
        user.set({age: data.age + 1})
        await user.save()
        await user.delete()

        expect(dataBefore).toEqual({name: data.name, age: data.age + 1})
        expect(dataAfter).toBe(null)
    })
})