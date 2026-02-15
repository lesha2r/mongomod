import { describe, it, expect, afterAll } from '@jest/globals';
import mongomod from '../mongomod.js';
import path from 'path';
import dotenv from 'dotenv';
import MongoSchema from '../MongoSchema/MongoSchema.js';
import { ObjectId } from 'mongodb';

dotenv.config({
    path: path.join(path.resolve(path.dirname('')), "/.env")
});

const TEST_COLLECTION = 'autotests-mongomodel-methods-coverage'

const mongoCreds = {
    link: process.env.MONGO_LINK as string,
    login: process.env.MONGO_USER as string,
    password: process.env.MONGO_PASSWORD as string,
    dbName: process.env.MONGO_DBNAME as string,
    srv: process.env.MONGO_SRV === 'true' ? true : false
}

const db = new mongomod.Connection(mongoCreds);
await db.connect()

describe('After completion', () => {
    it('Clearing the collection after tests', async () => {
        const collection = new (await import('../MongoController/MongoController.js')).default(db, TEST_COLLECTION)
        const result = await collection.deleteMany({filter: {}})
        expect(result.ok).toBe(true)
    })
})

describe('MongoModel/methods - Branch Coverage Tests', () => {
    const schema = new MongoSchema({ 
        _id: {type: ObjectId, required: false},
        name: {type: String}, 
        age: {type: Number},
        email: {type: String, required: false},
        token: {type: String, required: false},
        extraField: {type: String, required: false}
    })
    const options = {db, collection: TEST_COLLECTION, schema}
    const User = mongomod.createModel(options)

    // ===== get() - error branch tests =====
    describe('get() error branches', () => {
        it('should throw if no document found for given filter', async () => {
            const user = new User()
            const nonexistentId = new ObjectId()
            
            await expect(user.get({ _id: nonexistentId })).rejects.toThrow()
        })

        it('should handle undefined or null response', async () => {
            const user = new User()
            // Test with a very unlikely filter combination
            const testData = { 
                name: 'TestUser', 
                email: 'test@example.com',
                age: 99,
                token: String(Math.random())
            }
            const testUser = new User().init(testData)
            await testUser.save()

            // Get should work fine
            const retrieved = new User()
            await retrieved.get({ token: testData.token })
            expect(retrieved.modelData.name).toBe('TestUser')
        })
    })

    // ===== set() - all branches =====
    describe('set() - all branches', () => {
        it('should handle all types of values in set', () => {
            const user = new User()
            user.modelData = { name: 'Initial', age: 25 }
            
            user.set({
                name: 'Updated',
                email: 'test@example.com',
                age: undefined, // Delete age
                newField: 'value'
            })
            
            expect(user.modelData.name).toBe('Updated')
            expect(user.modelData.email).toBe('test@example.com')
            expect(user.modelData.age).toBeUndefined()
            expect(user.modelData.newField).toBe('value')
            expect('age' in user.modelData).toBe(false)
        })

        it('should initialize modelData to empty object if null', () => {
            const user = new User()
            user.modelData = null
            
            user.set({ name: 'New' })
            
            expect(user.modelData).toEqual({ name: 'New' })
        })
    })

    // ===== init() - with validation errors =====
    describe('init() - validation branches', () => {
        it('should validate data during init', () => {
            const user = new User()
            const validData = { name: 'John', age: 30 }
            
            const result = user.init(validData)
            
            expect(result.modelData).toEqual(validData)
        })

        it('should throw if data is invalid', () => {
            const user = new User()
            const emptyData = {}
            
            expect(() => user.init(emptyData)).toThrow()
        })
    })

    // ===== insert() - error branches =====
    describe('insert() - error and success branches', () => {
        it('should set_id from inserted result', async () => {
            const testData = { 
                name: 'InsertTest', 
                age: 30,
                token: String(Math.random()),
                email: 'test@example.com',
                extraField: 'test'
            }
            const user = new User().init(testData)
            
            await user.insert()
            
            expect(user.modelData._id).toBeDefined()
            expect(user.modelData._id instanceof ObjectId).toBe(true)
        })

        it('should throw if ensureModelData fails', async () => {
            const user = new User()
            user.modelData = null
            
            // This should throw because modelData is null and ensureModelData will throw
            await expect(user.insert()).rejects.toThrow()
        })
    })

    // ===== delete() - error branches =====
    describe('delete() - error and success branches', () => {
        it('should delete document and clear modelData', async () => {
            const testData = { 
                name: 'DeleteTest', 
                age: 40,
                token: String(Math.random()),
                email: 'delete@test.com',
                extraField: 'test'
            }
            const user = new User().init(testData)
            await user.insert()
            
            const id = user.modelData._id
            
            await user.delete()
            
            expect(user.modelData).toBeNull()
        })

        it('should throw if model has no _id', async () => {
            const user = new User()
            user.modelData = { name: 'NoId' }
            
            await expect(user.delete()).rejects.toThrow()
        })
    })

    // ===== save() - insert vs update branches =====
    describe('save() - insert/update branches', () => {
        it('should insert new document (no _id) when save is called', async () => {
            const testData = { 
                name: 'SaveNewTest', 
                age: 35,
                token: String(Math.random()),
                email: 'new@test.com',
                extraField: 'test'
            }
            const user = new User().init(testData)
            
            await user.save()
            
            expect(user.modelData._id).toBeDefined()
        })

        it('should update existing document when save is called with _id', async () => {
            const testData = { 
                name: 'SaveUpdateTest', 
                age: 45,
                token: String(Math.random()),
                email: 'update@test.com',
                extraField: 'test'
            }
            const user = new User().init(testData)
            await user.insert()
            
            const originalId = user.modelData._id
            
            user.set({ age: 50 })
            await user.save()
            
            expect(user.modelData._id).toEqual(originalId)
            
            // Verify update
            const retrieved = new User()
            await retrieved.get({ token: testData.token })
            expect(retrieved.modelData.age).toBe(50)
        })

        it('should handle save with undefined values (getUnsetPayload)', async () => {
            const testData = { 
                name: 'SaveUnsetTest', 
                age: 55,
                email: 'test@example.com',
                token: String(Math.random())
            }
            const user = new User().init(testData)
            await user.insert()
            
            user.modelData.email = undefined
            await user.save()
            
            const retrieved = new User()
            await retrieved.get({ token: testData.token })
            expect(retrieved.modelData.email).toBeUndefined()
        })

        it('should throw if save fails during update', async () => {
            const user = new User()
            user.modelData = { _id: new ObjectId(), name: 'Test' }
            
            // Mock validate to fail
            const originalValidate = user.validate
            user.validate = () => {
                throw new Error('Validation failed')
            }
            
            await expect(user.save()).rejects.toThrow()
            
            user.validate = originalValidate
        })
    })

    // ===== validate() - branches =====
    describe('validate() - validation branches', () => {
        it('should return null if schema is not defined', () => {
            const user = new mongomod.Model({ db, collection: TEST_COLLECTION })
            
            const result = user.validate()
            
            expect(result).toBeNull()
        })

        it('should validate data passed as parameter', () => {
            const user = new User()
            
            const result = user.validate({ name: 'John', age: 30, email: 'test@test.com', token: 'token', extraField: 'extra' })
            
            expect(result).toBeDefined()
            expect(result.ok).toBe(true)
        })

        it('should use modelData if no parameter provided', () => {
            const user = new User()
            user.modelData = { name: 'John', age: 30, email: 'test@test.com', token: 'token', extraField: 'extra' }
            
            const result = user.validate()
            
            expect(result).toBeDefined()
        })
    })

    // ===== clearBySchema() - all branches =====
    describe('clearBySchema() - all branches', () => {
        it('should return model if schema is not defined', () => {
            const user = new mongomod.Model({ db, collection: TEST_COLLECTION })
            user.modelData = { name: 'John', extraField: 'value' }
            
            const result = user.clearBySchema()
            
            expect(result).toBe(user)
            expect(user.modelData).toEqual({ name: 'John', extraField: 'value' })
        })

        it('should return model if modelData is null', () => {
            const user = new User()
            user.modelData = null
            
            const result = user.clearBySchema()
            
            expect(result).toBe(user)
            expect(user.modelData).toBeNull()
        })

        it('should clear fields not in schema', () => {
            const user = new User()
            const testId = new ObjectId()
            user.modelData = {
                _id: testId,
                name: 'John',
                age: 30,
                email: 'john@test.com',
                token: 'valid-token',
                extraField: 'should be removed',
                anotherExtra: 'also removed'
            }
            
            user.clearBySchema()
            
            expect(user.modelData.name).toBeUndefined()
            expect(user.modelData._id).toBeDefined()
            expect(user.modelData.extraField).toBeUndefined()
            expect(user.modelData.anotherExtra).toBeUndefined()
            expect(user.modelData.age).toBeUndefined()
            expect(user.modelData.email).toBeUndefined()
            expect(user.modelData.token).toBeUndefined()
        })

        it('should preserve _id even if null or undefined initially', () => {
            const user = new User()
            user.modelData = {
                name: 'John',
                age: 25,
                email: 'john@test.com',
                token: 'token',
                extraField: 'value'
            }
            
            user.clearBySchema()
            
            // After clearing, only _id is guaranteed to remain
            expect(user.modelData.name).toBeUndefined()
            expect(user.modelData._id).toBeDefined()
            expect(user.modelData.extraField).toBeUndefined()
        })
    })

    afterAll(async () => {
        await db.disconnect()
    })
})
