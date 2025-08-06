import mongomod from "../dist/mongomod.js";

describe('MongoSchema. Validation', () => {
    test('should throw if schema is not an object', () => {
        expect(() => {
            new mongomod.Schema('not an object');
        }).toThrow();
    })

    test('should throw if schema is null', () => {
        expect(() => {
            // @ts-ignore
            new mongomod.Schema(null);
        }).toThrow();
    })

    test('should throw if schema is an array', () => {
        expect(() => {
            // @ts-ignore
            new mongomod.Schema([]);
        }).toThrow();
    })

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
    })
})