import Schema from 'validno';
type MongomodSchemaSettings = {
    strict: boolean;
};
declare class MongoSchema {
    settings: MongomodSchemaSettings;
    schema: typeof Schema;
    constructor(schemaObj?: {
        [key: string]: any;
    }, options?: MongomodSchemaSettings);
    validate(data: any, fields?: string | string[]): any;
}
export default MongoSchema;
