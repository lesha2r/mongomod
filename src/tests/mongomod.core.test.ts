import { describe, it, expect } from '@jest/globals';
import mongomod from '../mongomod.js';

const db = new mongomod.Connection({
    link: 'localhost',
    login: 'user',
    password: 'pass',
    dbName: 'test'
});

describe('mongomod root exports', () => {
    it('exposes core types and factories', () => {
        expect(mongomod).toBeDefined();
        expect(typeof mongomod.Schema).toBe('function');
        expect(typeof mongomod.Controller).toBe('function');
        expect(typeof mongomod.Connection).toBe('function');
        expect(typeof mongomod.Model).toBe('function');
        expect(typeof mongomod.createModel).toBe('function');
    });
});

describe('mongomod.createModel validation', () => {
    it('throws when db is not a MongoConnection instance', () => {
        expect(() => mongomod.createModel({ db: {} as any, collection: 'users' })).toThrow();
    });

    it('throws when schema is not a MongoSchema instance', () => {
        expect(() => mongomod.createModel({ db, collection: 'users', schema: {} as any })).toThrow();
    });

    it('throws when customs is not an object', () => {
        expect(() => mongomod.createModel({ db, collection: 'users', customs: 'bad' as any })).toThrow();
    });

    it('throws when customs contains reserved method names', () => {
        expect(() => mongomod.createModel({
            db,
            collection: 'users',
            customs: {
                save() {
                    return 'reserved';
                }
            }
        })).toThrow();
    });

    it('throws when customs contains non-function values', () => {
        expect(() => mongomod.createModel({
            db,
            collection: 'users',
            customs: {
                greet: 'hello'
            }
        })).toThrow();
    });
});

describe('mongomod.createModel behavior', () => {
    it('creates a model class with custom methods bound to instances', () => {
        const User = mongomod.createModel({
            db,
            collection: 'users',
            customs: {
                // @ts-ignore
                greet() {
                    // @ts-ignore
                    return `hi ${this.modelData?.name || 'anon'}`;
                }
            }
        });

        const user = new User();
        user.modelData = { name: 'Alice' };

        expect(user.greet()).toBe('hi Alice');
    });

    it('creates a model class with static controller helpers', () => {
        const User = mongomod.createModel({
            db,
            collection: 'users'
        });

        expect(typeof User.findOne).toBe('function');
        expect(typeof User.findMany).toBe('function');
        expect(typeof User.insertOne).toBe('function');
        expect(typeof User.updateOne).toBe('function');
        expect(typeof User.deleteOne).toBe('function');
    });
});
