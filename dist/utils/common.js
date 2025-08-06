export const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
export const filterObject = (obj, allowedKeys) => {
    return Object.fromEntries(Object.entries(obj).filter(([key]) => allowedKeys.includes(key)));
};
