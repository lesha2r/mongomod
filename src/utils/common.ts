export const delay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const filterObject = (obj: { [key: string]: any }, allowedKeys: string[]) => {
    return Object.fromEntries(Object.entries(obj).filter(([key]) => allowedKeys.includes(key)));
}