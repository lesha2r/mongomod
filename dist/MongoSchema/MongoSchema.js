import Schema from 'validno';
const validateSchemaInput = (input) => {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
        throw new Error('Schema definition must be a non-null object');
    }
};
class MongoSchema {
    settings;
    schema;
    constructor(schemaObj = {}, options = { strict: false }) {
        validateSchemaInput(schemaObj);
        this.settings = {
            strict: options.strict || true
        };
        this.schema = new Schema(schemaObj);
    }
    validate(data) {
        return this.schema.validate(data);
    }
}
export default MongoSchema;
