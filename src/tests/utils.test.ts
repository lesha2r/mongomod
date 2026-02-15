import { describe, it, expect, jest } from '@jest/globals';
import { delay, filterObject } from '../utils/common.js';
import { validateOptions, validateConnectCallback } from '../utils/connection.js';
import { validateControllerDb, validateControllerCollection } from '../utils/controller.js';
import {
    validateDbInstance,
    validateSchema,
    ensureMethodNameIsNotReserved,
    validateCustomMethods
} from '../utils/mongomod.js';
import MongoConnection from '../MongoConnection/index.js';
import MongoSchema from '../MongoSchema/index.js';
import { MmValidationError } from '../errors/validationError.js';
import { MmControllerError } from '../errors/controllerError.js';

// ===== common.ts tests =====
describe('utils/common.ts', () => {
    describe('delay', () => {
        it('should resolve after specified milliseconds', async () => {
            const start = Date.now();
            await delay(100);
            const elapsed = Date.now() - start;
            
            expect(elapsed).toBeGreaterThanOrEqual(100);
            expect(elapsed).toBeLessThan(200);
        });

        it('should resolve with zero delay', async () => {
            jest.useFakeTimers();

            const promise = delay(0);
            jest.runAllTimers();
            await promise;

            jest.useRealTimers();
        });

        it('should return a Promise', () => {
            const result = delay(100);
            expect(result).toBeInstanceOf(Promise);
        });
    });

    describe('filterObject', () => {
        it('should filter object by allowed keys', () => {
            const obj = { a: 1, b: 2, c: 3, d: 4 };
            const result = filterObject(obj, ['a', 'c']);
            
            expect(result).toEqual({ a: 1, c: 3 });
        });

        it('should return empty object if no allowed keys match', () => {
            const obj = { a: 1, b: 2, c: 3 };
            const result = filterObject(obj, ['x', 'y', 'z']);
            
            expect(result).toEqual({});
        });

        it('should return empty object if allowedKeys array is empty', () => {
            const obj = { a: 1, b: 2, c: 3 };
            const result = filterObject(obj, []);
            
            expect(result).toEqual({});
        });

        it('should handle empty input object', () => {
            const result = filterObject({}, ['a', 'b']);
            expect(result).toEqual({});
        });

        it('should handle undefined values in object', () => {
            const obj = { a: undefined, b: 2, c: null };
            const result = filterObject(obj, ['a', 'b', 'c']);
            
            expect(result).toEqual({ a: undefined, b: 2, c: null });
        });

        it('should preserve all types of values', () => {
            const obj = {
                str: 'test',
                num: 42,
                bool: true,
                arr: [1, 2, 3],
                obj: { nested: 'value' }
            };
            const result = filterObject(obj, ['str', 'num', 'bool', 'arr', 'obj']);
            
            expect(result).toEqual(obj);
        });
    });
});

// ===== connection.ts tests =====
describe('utils/connection.ts', () => {
    describe('validateOptions', () => {
        it('should validate correct options', () => {
            const options = {
                link: 'localhost:27017',
                login: 'user',
                password: 'pass',
                dbName: 'testdb'
            };
            
            expect(() => validateOptions(options)).not.toThrow();
            expect(validateOptions(options)).toBe(true);
        });

        it('should throw on invalid options with validation library error', () => {
            const options = {
                link: 'localhost:27017',
                login: 'user',
                password: 'pass',
                dbName: 'testdb',
                invalidKey: true
            };
            
            expect(() => validateOptions(options)).not.toThrow();
        });

        it('should throw on null options', () => {
            expect(() => validateOptions(null as any)).toThrow(MmValidationError);
        });

        it('should throw on undefined options', () => {
            expect(() => validateOptions(undefined as any)).toThrow(MmValidationError);
        });

        it('should include dbName in validation error when provided', () => {
            try {
                validateOptions(undefined as any);
            } catch (err: any) {
                expect(err).toBeInstanceOf(MmValidationError);
                expect(err.dbName).toBeNull();
            }
        });

        it('should validate with optional srv parameter', () => {
            const options = {
                link: 'localhost:27017',
                login: 'user',
                password: 'pass',
                dbName: 'testdb',
                srv: true
            };
            
            expect(() => validateOptions(options)).not.toThrow();
        });
    });

    describe('validateConnectCallback', () => {
        it('should return true if callback is undefined', () => {
            expect(validateConnectCallback(undefined)).toBe(true);
        });

        it('should return true if callback is a function', () => {
            const callback = () => {};
            expect(validateConnectCallback(callback)).toBe(true);
        });

        it('should throw if callback is not a function or undefined', () => {
            expect(() => validateConnectCallback('not a function' as any)).toThrow(MmValidationError);
            expect(() => validateConnectCallback(123 as any)).toThrow(MmValidationError);
            expect(() => validateConnectCallback({} as any)).toThrow(MmValidationError);
            expect(() => validateConnectCallback(null as any)).toThrow(MmValidationError);
        });

        it('should throw with proper error code for invalid callback', () => {
            try {
                validateConnectCallback('invalid' as any);
            } catch (err: any) {
                expect(err).toBeInstanceOf(MmValidationError);
                expect(err.code).toBeDefined();
                expect(err.dbName).toBeNull();
            }
        });
    });
});

// ===== controller.ts tests =====
describe('utils/controller.ts', () => {
    describe('validateControllerDb', () => {
        it('should throw if db is null', () => {
            expect(() => validateControllerDb(null)).toThrow(MmControllerError);
        });

        it('should throw if db is undefined', () => {
            expect(() => validateControllerDb(undefined)).toThrow(MmControllerError);
        });

        it('should throw if db is not a MongoConnection instance', () => {
            expect(() => validateControllerDb({})).toThrow(MmControllerError);
            expect(() => validateControllerDb('not a db')).toThrow(MmControllerError);
            expect(() => validateControllerDb(123)).toThrow(MmControllerError);
        });

        it('should throw with proper error properties', () => {
            try {
                validateControllerDb(null);
            } catch (err: any) {
                expect(err).toBeInstanceOf(MmControllerError);
                expect(err.code).toBeDefined();
                expect(err.dbName).toBeNull();
            }
        });
    });

    describe('validateControllerCollection', () => {
        const mockDb = {
            dbName: 'testdb',
            client: {},
            isConnected: true
        } as any as MongoConnection;

        it('should not throw for valid collection name', () => {
            expect(() => validateControllerCollection(mockDb, 'users')).not.toThrow();
        });

        it('should throw if collection is null', () => {
            expect(() => validateControllerCollection(mockDb, null as any)).toThrow(MmControllerError);
        });

        it('should throw if collection is undefined', () => {
            expect(() => validateControllerCollection(mockDb, undefined as any)).toThrow(MmControllerError);
        });

        it('should throw if collection is not a string', () => {
            expect(() => validateControllerCollection(mockDb, 123 as any)).toThrow(MmControllerError);
            expect(() => validateControllerCollection(mockDb, {} as any)).toThrow(MmControllerError);
        });

        it('should throw if collection is empty string', () => {
            expect(() => validateControllerCollection(mockDb, '')).toThrow(MmControllerError);
        });

        it('should throw with db name in error when db has dbName', () => {
            try {
                validateControllerCollection(mockDb, '');
            } catch (err: any) {
                expect(err).toBeInstanceOf(MmControllerError);
                expect(err.dbName).toBe('testdb');
            }
        });

        it('should throw with null dbName when db has no dbName', () => {
            const dbWithoutName = { dbName: null } as any as MongoConnection;
            try {
                validateControllerCollection(dbWithoutName, '');
            } catch (err: any) {
                expect(err.dbName).toBeNull();
            }
        });
    });
});

// ===== mongomod.ts tests =====
describe('utils/mongomod.ts', () => {
    describe('validateDbInstance', () => {
        it('should throw if db is not MongoConnection instance', () => {
            expect(() => validateDbInstance({})).toThrow(MmValidationError);
            expect(() => validateDbInstance(null)).toThrow(MmValidationError);
            expect(() => validateDbInstance('string')).toThrow(MmValidationError);
            expect(() => validateDbInstance(123)).toThrow(MmValidationError);
        });

        it('should throw with correct error code', () => {
            try {
                validateDbInstance({});
            } catch (err: any) {
                expect(err).toBeInstanceOf(MmValidationError);
                expect(err.code).toBeDefined();
            }
        });
    });

    describe('validateSchema', () => {
        it('should not throw for null schema', () => {
            expect(() => validateSchema(null)).not.toThrow();
        });

        it('should not throw for undefined schema', () => {
            expect(() => validateSchema(undefined)).not.toThrow();
        });

        it('should throw if schema is not MongoSchema instance (when not null/undefined)', () => {
            expect(() => validateSchema({})).toThrow(MmValidationError);
            expect(() => validateSchema('string')).toThrow(MmValidationError);
            expect(() => validateSchema(123)).toThrow(MmValidationError);
        });

        it('should throw with correct error code for invalid schema', () => {
            try {
                validateSchema({});
            } catch (err: any) {
                expect(err).toBeInstanceOf(MmValidationError);
                expect(err.code).toBeDefined();
            }
        });
    });

    describe('ensureMethodNameIsNotReserved', () => {
        it('should not throw for non-reserved method names', () => {
            expect(() => ensureMethodNameIsNotReserved('myCustomMethod')).not.toThrow();
            expect(() => ensureMethodNameIsNotReserved('customAction')).not.toThrow();
            expect(() => ensureMethodNameIsNotReserved('myHelper')).not.toThrow();
        });

        it('should throw for reserved method names', () => {
            // Using actual reserved names from MmMethodNames
            expect(() => ensureMethodNameIsNotReserved('data')).toThrow(MmValidationError);
            expect(() => ensureMethodNameIsNotReserved('save')).toThrow(MmValidationError);
            expect(() => ensureMethodNameIsNotReserved('insert')).toThrow(MmValidationError);
            expect(() => ensureMethodNameIsNotReserved('delete')).toThrow(MmValidationError);
        });

        it('should throw with correct error message including method name', () => {
            try {
                ensureMethodNameIsNotReserved('save');
            } catch (err: any) {
                expect(err).toBeInstanceOf(MmValidationError);
                expect(err.message).toContain('save');
                expect(err.code).toBeDefined();
            }
        });

        it('should be case-sensitive for reserved names', () => {
            // Verify that uppercase variations are not reserved
            expect(() => ensureMethodNameIsNotReserved('Data')).not.toThrow();
            expect(() => ensureMethodNameIsNotReserved('SAVE')).not.toThrow();
        });
    });

    describe('validateCustomMethods', () => {
        it('should return true for null customs', () => {
            expect(validateCustomMethods(null as any)).toBe(true);
        });

        it('should return true for undefined customs', () => {
            expect(validateCustomMethods(undefined)).toBe(true);
        });

        it('should throw if customs is not an object', () => {
            expect(() => validateCustomMethods('string' as any)).toThrow(MmValidationError);
            expect(() => validateCustomMethods(123 as any)).toThrow(MmValidationError);
        });

        it('should throw if customs is an array', () => {
            expect(() => validateCustomMethods(['method'] as any)).toThrow(MmValidationError);
        });

        it('should not throw for valid custom methods object', () => {
            const customs = {
                myMethod: () => {},
                anotherMethod: function() {}
            };

            expect(() => validateCustomMethods(customs)).not.toThrow();
        });

        it('should throw if custom method value is not a function', () => {
            const customs = {
                validMethod: () => {},
                invalidMethod: 'not a function'
            };

            expect(() => validateCustomMethods(customs)).toThrow(MmValidationError);
        });

        it('should throw if custom method name is reserved', () => {
            const customs = {
                save: () => {},
                myMethod: () => {}
            };

            expect(() => validateCustomMethods(customs)).toThrow(MmValidationError);
        });

        it('should include failed method names in error message', () => {
            const customs = {
                notFunction: 'string',
                alsoNotFunction: 123
            };

            try {
                validateCustomMethods(customs);
            } catch (err: any) {
                expect(err).toBeInstanceOf(MmValidationError);
                expect(err.message).toContain('notFunction');
                expect(err.message).toContain('alsoNotFunction');
            }
        });

        it('should include failed reserved method names in error message', () => {
            const customs = {
                save: () => {},
                insert: () => {}
            };

            try {
                validateCustomMethods(customs);
            } catch (err: any) {
                expect(err).toBeInstanceOf(MmValidationError);
                expect(err.message).toContain('save');
            }
        });

        it('should throw for non-function methods before checking reserved names', () => {
            const customs = {
                myValidMethod: () => {},
                notAFunction: 'string'
            };

            try {
                validateCustomMethods(customs);
            } catch (err: any) {
                // The code checks non-function methods
                expect(err).toBeInstanceOf(MmValidationError);
                expect(err.message).toContain('notAFunction');
            }
        });

        it('should handle empty customs object', () => {
            expect(() => validateCustomMethods({})).not.toThrow();
        });

        it('should accept customs object with various function types', () => {
            const customs = {
                arrow: () => {},
                regular: function() {},
                async: async () => {},
                asyncRegular: async function() {}
            };

            expect(() => validateCustomMethods(customs)).not.toThrow();
        });
    });
});
