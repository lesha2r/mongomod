class QueryResult<T = any> {
  constructor(
    public ok: boolean,
    public data: T | T[] | null,
    public error: Error | null = null,
  ) {}

  hasData(): boolean {
    return this.data !== null && this.data !== undefined;
  }

  first(): T | null {
    if (Array.isArray(this.data)) {
      return this.data[0] || null;
    }

    return this.data;
  }
}

export default QueryResult