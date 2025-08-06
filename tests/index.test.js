import mongomod from '../dist/index.js';

describe('index.js returns a mongomod instance', () => {
    it('should return a mongomod instance', () => {
        
        expect(mongomod).toBeDefined();
        expect(typeof mongomod).toBe('object');
    });

    it('should have createModel function', () => {
        expect(mongomod.createModel).toBeDefined();
        expect(typeof mongomod.createModel).toBe('function');
    });
})