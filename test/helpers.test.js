import { getValueType } from "../src/helpers";

// TODO: https://jestjs.io/ru/docs/mongodb

test('getValue type returns correct type for array', () => {
    expect(getValueType( ['1', '2'] )).toBe('array');
});

test('getValue type returns correct type for object', () => {
    expect(getValueType( { a: true } ))
        .toBe('object');
});

test('getValue type returns correct type for date', () => {
    expect(getValueType( new Date() ))
        .toBe('date');
});

test('getValue type returns correct type for string', () => {
    expect(getValueType( 'text' ))
        .toBe('string');
});

test('getValue type returns correct type for null', () => {
    expect(getValueType( null ))
        .toBe('null');
});

test('getValue type returns correct type for number', () => {
    expect(getValueType( 100 ))
        .toBe('number');
});

test('getValue type returns correct type for undefined', () => {
    expect(getValueType( undefined ))
        .toBe('undefined');
});