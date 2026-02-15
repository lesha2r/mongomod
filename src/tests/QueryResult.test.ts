import { describe, it, expect } from '@jest/globals';
import QueryResult from '../QueryResult.js';

describe('QueryResult', () => {
    it('hasData returns false for null or undefined', () => {
        const nullResult = new QueryResult(true, null);
        const undefinedResult = new QueryResult(true, undefined as unknown as null);

        expect(nullResult.hasData()).toBe(false);
        expect(undefinedResult.hasData()).toBe(false);
    });

    it('hasData returns true for falsy values', () => {
        const zeroResult = new QueryResult(true, 0 as unknown as number);
        const emptyStringResult = new QueryResult(true, '' as unknown as string);

        expect(zeroResult.hasData()).toBe(true);
        expect(emptyStringResult.hasData()).toBe(true);
    });

    it('first returns the first array element or null', () => {
        const arrayResult = new QueryResult(true, [1, 2, 3]);
        const emptyArrayResult = new QueryResult(true, [] as number[]);

        expect(arrayResult.first()).toBe(1);
        expect(emptyArrayResult.first()).toBeNull();
    });

    it('first returns non-array data as-is', () => {
        const objectData = { id: 1 };
        const objectResult = new QueryResult(true, objectData);
        const nullResult = new QueryResult(true, null);

        expect(objectResult.first()).toBe(objectData);
        expect(nullResult.first()).toBeNull();
    });
});
