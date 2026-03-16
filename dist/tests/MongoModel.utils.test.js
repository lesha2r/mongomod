import { describe, it, expect, beforeEach } from '@jest/globals';
import constructorUtils from '../MongoModel/utils/constructor.utils.js';
import { MmValidationError } from '../errors/validationError.js';
describe('MongoModel/utils/constructor.utils.ts', () => {
    let mockModel;
    beforeEach(() => {
        mockModel = {
            myMethod: null,
            anotherMethod: null
        };
    });
    describe('parseCustomMethods', () => {
        it('should bind function methods to the model instance', () => {
            const customMethods = {
                myCustomMethod: function () {
                    return 'test';
                }
            };
            constructorUtils.parseCustomMethods.call(mockModel, customMethods);
            expect(mockModel.myCustomMethod).toBeDefined();
            expect(typeof mockModel.myCustomMethod).toBe('function');
            expect(mockModel.myCustomMethod()).toBe('test');
        });
        it('should bind arrow functions to the model instance', () => {
            const customMethods = {
                arrowMethod: () => 'arrow result'
            };
            constructorUtils.parseCustomMethods.call(mockModel, customMethods);
            expect(mockModel.arrowMethod).toBeDefined();
            expect(mockModel.arrowMethod()).toBe('arrow result');
        });
        it('should bind async functions to the model instance', async () => {
            const customMethods = {
                asyncMethod: async function () {
                    return 'async result';
                }
            };
            constructorUtils.parseCustomMethods.call(mockModel, customMethods);
            expect(mockModel.asyncMethod).toBeDefined();
            const result = await mockModel.asyncMethod();
            expect(result).toBe('async result');
        });
        it('should handle multiple custom methods', () => {
            const customMethods = {
                method1: () => 'result1',
                method2: () => 'result2',
                method3: function () { return 'result3'; }
            };
            constructorUtils.parseCustomMethods.call(mockModel, customMethods);
            expect(mockModel.method1()).toBe('result1');
            expect(mockModel.method2()).toBe('result2');
            expect(mockModel.method3()).toBe('result3');
        });
        it('should preserve method context (this binding)', () => {
            const customMethods = {
                getThisValue: function () {
                    return this.testProp;
                }
            };
            mockModel.testProp = 'bound value';
            constructorUtils.parseCustomMethods.call(mockModel, customMethods);
            expect(mockModel.getThisValue()).toBe('bound value');
        });
        it('should throw if a custom method is not a function', () => {
            const customMethods = {
                validMethod: () => { },
                invalidMethod: 'not a function'
            };
            expect(() => {
                constructorUtils.parseCustomMethods.call(mockModel, customMethods);
            }).toThrow(MmValidationError);
        });
        it('should throw with proper error message for non-function method', () => {
            const customMethods = {
                notAFunction: 123
            };
            try {
                constructorUtils.parseCustomMethods.call(mockModel, customMethods);
            }
            catch (err) {
                expect(err).toBeInstanceOf(MmValidationError);
                expect(err.message).toContain('notAFunction');
            }
        });
        it('should throw and include multiple failed methods in error message', () => {
            const customMethods = {
                validMethod: () => { },
                failedMethod1: 'string',
                failedMethod2: 123,
                failedMethod3: {}
            };
            try {
                constructorUtils.parseCustomMethods.call(mockModel, customMethods);
            }
            catch (err) {
                expect(err).toBeInstanceOf(MmValidationError);
                expect(err.message).toContain('failedMethod1');
                expect(err.message).toContain('failedMethod2');
                expect(err.message).toContain('failedMethod3');
            }
        });
        it('should not throw if no custom methods are provided', () => {
            expect(() => {
                constructorUtils.parseCustomMethods.call(mockModel, undefined);
            }).not.toThrow();
        });
        it('should handle empty custom methods object', () => {
            expect(() => {
                constructorUtils.parseCustomMethods.call(mockModel, {});
            }).not.toThrow();
        });
        it('should bind methods with various return types', () => {
            const customMethods = {
                returnString: () => 'string',
                returnNumber: () => 42,
                returnBoolean: () => true,
                returnArray: () => [1, 2, 3],
                returnObject: () => ({ key: 'value' }),
                returnNull: () => null,
                returnUndefined: () => undefined
            };
            constructorUtils.parseCustomMethods.call(mockModel, customMethods);
            expect(mockModel.returnString()).toBe('string');
            expect(mockModel.returnNumber()).toBe(42);
            expect(mockModel.returnBoolean()).toBe(true);
            expect(mockModel.returnArray()).toEqual([1, 2, 3]);
            expect(mockModel.returnObject()).toEqual({ key: 'value' });
            expect(mockModel.returnNull()).toBeNull();
            expect(mockModel.returnUndefined()).toBeUndefined();
        });
        it('should accept methods with parameters', () => {
            const customMethods = {
                add: (a, b) => a + b,
                concat: (str1, str2) => `${str1}${str2}`
            };
            constructorUtils.parseCustomMethods.call(mockModel, customMethods);
            expect(mockModel.add(5, 3)).toBe(8);
            expect(mockModel.concat('Hello', 'World')).toBe('HelloWorld');
        });
        it('should handle only invalid methods and throw', () => {
            const customMethods = {
                invalid1: 'string',
                invalid2: 123,
                invalid3: true
            };
            expect(() => {
                constructorUtils.parseCustomMethods.call(mockModel, customMethods);
            }).toThrow(MmValidationError);
            try {
                constructorUtils.parseCustomMethods.call(mockModel, customMethods);
            }
            catch (err) {
                expect(err.message).toContain('invalid1');
                expect(err.message).toContain('invalid2');
                expect(err.message).toContain('invalid3');
            }
        });
        it('should not bind methods if any validation fails', () => {
            const customMethods = {
                validMethod: () => 'valid',
                invalidMethod: 'invalid'
            };
            try {
                constructorUtils.parseCustomMethods.call(mockModel, customMethods);
            }
            catch (err) {
            }
            expect(mockModel.invalidMethod).toBeUndefined();
        });
        it('should handle method names that shadow built-in properties', () => {
            const customMethods = {
                toString: () => 'custom toString',
                valueOf: () => 'custom valueOf'
            };
            constructorUtils.parseCustomMethods.call(mockModel, customMethods);
            expect(mockModel.toString()).toBe('custom toString');
            expect(mockModel.valueOf()).toBe('custom valueOf');
        });
        it('should verify error has proper validation error code', () => {
            const customMethods = {
                notFunction: []
            };
            try {
                constructorUtils.parseCustomMethods.call(mockModel, customMethods);
            }
            catch (err) {
                expect(err).toBeInstanceOf(MmValidationError);
                expect(err.code).toBeDefined();
                expect(typeof err.code).toBe('string');
            }
        });
        it('should handle methods with side effects', () => {
            const sideEffects = [];
            const customMethods = {
                method1: () => {
                    sideEffects.push('method1 called');
                    return 'result1';
                },
                method2: () => {
                    sideEffects.push('method2 called');
                    return 'result2';
                }
            };
            constructorUtils.parseCustomMethods.call(mockModel, customMethods);
            mockModel.method1();
            expect(sideEffects).toContain('method1 called');
            mockModel.method2();
            expect(sideEffects).toContain('method2 called');
        });
        it('should bind mixed valid and invalid methods with proper error', () => {
            const customMethods = {
                func1: () => 'valid1',
                invalid: 'string',
                func2: () => 'valid2'
            };
            expect(() => {
                constructorUtils.parseCustomMethods.call(mockModel, customMethods);
            }).toThrow(MmValidationError);
        });
    });
});
