import mongomod from "../mongomod.js";
import { describe, test, expect, beforeEach } from '@jest/globals';
describe('MongoSchema. Validation', () => {
    test('should throw if schema is not an object', () => {
        expect(() => {
            new mongomod.Schema('not an object');
        }).toThrow();
    });
    test('should throw if schema is null', () => {
        expect(() => {
            new mongomod.Schema(null);
        }).toThrow();
    });
    test('should throw if schema is an array', () => {
        expect(() => {
            new mongomod.Schema([]);
        }).toThrow();
    });
    test('correct schema should not throw', () => {
        expect(() => {
            new mongomod.Schema({
                name: {
                    type: String,
                },
                age: {
                    type: Number,
                    required: true,
                },
                comment: {
                    type: String,
                    required: false
                }
            });
        }).not.toThrow();
    });
    describe('validate method', () => {
        let schema;
        beforeEach(() => {
            schema = new mongomod.Schema({
                name: {
                    type: String,
                    required: true
                },
                age: {
                    type: Number,
                    required: true
                },
                email: {
                    type: String,
                    required: false
                },
                comment: {
                    type: String,
                    required: false
                }
            });
        });
        describe('without fields parameter (validates all fields)', () => {
            test('should pass validation for valid data', () => {
                const data = {
                    name: 'John Doe',
                    age: 30,
                    email: 'john@example.com',
                    comment: 'Test comment'
                };
                const result = schema.validate(data);
                expect(result.ok).toBe(true);
                expect(result.errors).toHaveLength(0);
                expect(result.passed).toContain('name');
                expect(result.passed).toContain('age');
                expect(result.passed).toContain('email');
                expect(result.passed).toContain('comment');
            });
            test('should pass validation for valid data without optional fields', () => {
                const data = {
                    name: 'John Doe',
                    age: 30
                };
                const result = schema.validate(data);
                expect(result.ok).toBe(true);
                expect(result.errors).toHaveLength(0);
                expect(result.passed).toContain('name');
                expect(result.passed).toContain('age');
            });
            test('should fail validation for missing required fields', () => {
                const data = {
                    name: 'John Doe'
                };
                const result = schema.validate(data);
                expect(result.ok).toBe(false);
                expect(result.errors.length).toBeGreaterThan(0);
                expect(result.missed).toContain('age');
                expect(result.failed).toContain('age');
                expect(result.passed).toContain('name');
            });
            test('should fail validation for wrong data types', () => {
                const data = {
                    name: 'John Doe',
                    age: 'thirty'
                };
                const result = schema.validate(data);
                expect(result.ok).toBe(false);
                expect(result.errors.length).toBeGreaterThan(0);
                expect(result.failed).toContain('age');
                expect(result.passed).toContain('name');
            });
        });
        describe('with fields parameter (validates only specified fields)', () => {
            test('should pass validation for valid data with single field', () => {
                const data = {
                    name: 'John Doe',
                    age: 'invalid'
                };
                const result = schema.validate(data, 'name');
                expect(result.ok).toBe(true);
                expect(result.errors).toHaveLength(0);
                expect(result.passed).toContain('name');
                expect(result.passed).not.toContain('age');
            });
            test('should pass validation for valid data with multiple fields', () => {
                const data = {
                    name: 'John Doe',
                    age: 30,
                    email: 'john@example.com',
                    comment: 'invalid number'
                };
                const result = schema.validate(data, ['name', 'age', 'email']);
                expect(result.ok).toBe(true);
                expect(result.errors).toHaveLength(0);
                expect(result.passed).toContain('name');
                expect(result.passed).toContain('age');
                expect(result.passed).toContain('email');
                expect(result.passed).not.toContain('comment');
            });
            test('should fail validation for missing required field in specified fields', () => {
                const data = {
                    email: 'john@example.com'
                };
                const result = schema.validate(data, ['name', 'email']);
                expect(result.ok).toBe(false);
                expect(result.errors.length).toBeGreaterThan(0);
                expect(result.missed).toContain('name');
                expect(result.failed).toContain('name');
                expect(result.passed).toContain('email');
            });
            test('should fail validation for wrong data type in specified fields', () => {
                const data = {
                    name: 'John Doe',
                    age: 'invalid type'
                };
                const result = schema.validate(data, ['age']);
                expect(result.ok).toBe(false);
                expect(result.errors.length).toBeGreaterThan(0);
                expect(result.failed).toContain('age');
                expect(result.passed).not.toContain('name');
            });
            test('should validate optional fields correctly when specified', () => {
                const data = {
                    name: 'John Doe',
                    age: 30
                };
                const result = schema.validate(data, ['email']);
                expect(result.ok).toBe(true);
                expect(result.errors).toHaveLength(0);
            });
            test('should handle empty fields array (validates all fields like no fields parameter)', () => {
                const data = {
                    name: 'John Doe',
                    age: 30
                };
                const result = schema.validate(data, []);
                expect(result.ok).toBe(true);
                expect(result.errors).toHaveLength(0);
                expect(result.passed).toContain('name');
                expect(result.passed).toContain('age');
            });
        });
    });
});
