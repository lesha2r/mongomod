import mongomod from '../index.js';
import { describe, it, expect } from '@jest/globals';
describe('index.js returns a mongomod instance', () => {
    it('should return a mongomod instance', () => {
        expect(mongomod).toBeDefined();
        expect(typeof mongomod).toBe('object');
    });
    it('should have createModel function', () => {
        expect(mongomod.createModel).toBeDefined();
        expect(typeof mongomod.createModel).toBe('function');
    });
});
