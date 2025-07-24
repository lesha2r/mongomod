import { keyGenerate } from "../dist/utils";


test('keyGenerate generates unique strings with expected length', () => {
    const expectedLength = 5
    const uid = keyGenerate(expectedLength) 
    
    expect(typeof uid === 'string' && uid.length === expectedLength).toBe(true)
});