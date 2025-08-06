class QueryResult {
    ok;
    data;
    error;
    constructor(ok, data, error = null) {
        this.ok = ok;
        this.data = data;
        this.error = error;
    }
    hasData() {
        return this.data !== null && this.data !== undefined;
    }
    first() {
        if (Array.isArray(this.data)) {
            return this.data[0] || null;
        }
        return this.data;
    }
}
export default QueryResult;
