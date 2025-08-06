declare class QueryResult<T = any> {
    ok: boolean;
    data: T | T[] | null;
    error: Error | null;
    constructor(ok: boolean, data: T | T[] | null, error?: Error | null);
    hasData(): boolean;
    first(): T | null;
}
export default QueryResult;
