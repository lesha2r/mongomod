/**
 * Returns value type
 * @param {any} value value to check
 * @returns {string | undefined} type
 */
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

/**
 * Generates unique string id
 * @param {number} [length] expected key length
 * @returns {string} unique id
 */
export const keyGenerate = (length = 16) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let secretPhrase = '';
  
    for (let i = 0; i < length; i++) {
      secretPhrase += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  
    return secretPhrase;
  };