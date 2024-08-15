const enum EBsonType {
    Any = 'any',
    String = 'string',
    Number = 'number',
    Object = 'object',
    Array = 'array',
    Date = 'date',
    Boolean = 'boolean',
    Null = 'null'
}

export type TSchemaType = 
    EBsonType.Any |
    EBsonType.String |
    EBsonType.Number |
    EBsonType.Object |
    EBsonType.Array |
    EBsonType.Date |
    EBsonType.Boolean |
    EBsonType.Null

export type TSchemaObj = {
    [key: string]: TSchemaType | TSchemaObj
}