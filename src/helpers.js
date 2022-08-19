export const getValueType = (value) => {
    let output = undefined;

    if (value instanceof Object) {
        if (Array.isArray(value)) return 'array';
        if (value instanceof Date) return 'date';

        output = 'object';
    } else if (typeof(value) === 'string' || value instanceof String) {
        output = 'string';
    } else if (typeof(value) === 'number') {
        output = 'number';
    } else if (value === null) {
        output = 'null';
    } else if (typeof value === 'boolean') {
        output = 'boolean';
    } else if (value === undefined) {
        output = 'undefined';
    }

    return output;
};