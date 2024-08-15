import { getValueType, keyGenerate } from "../dist/utils";

test('getValue correctly determines types', () => {
    expect(getValueType( ['1', '2'] )).toBe('array');

    expect(getValueType( { a: true } ))
    .toBe('object');

    expect(getValueType( new Date() ))
    .toBe('date');

    expect(getValueType( 'text' ))
    .toBe('string');

    expect(getValueType( null ))
    .toBe('null');

    expect(getValueType( 100 ))
    .toBe('number');

    expect(getValueType( undefined ))
    .toBe('undefined');
});

test('keyGenerate generates unique strings with expected length', () => {
    const expectedLength = 5
    const uid = keyGenerate(expectedLength) 
    expect(typeof uid === 'string' && uid.length === expectedLength).toBe(true)
});