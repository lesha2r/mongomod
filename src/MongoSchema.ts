// ** DONE **
import Schema from 'validno'

type MongomodSchemaSettings = { strict: boolean }

class MongoSchema {
    settings: MongomodSchemaSettings
    schema: typeof Schema

    constructor(
        schemaObj: { [key: string]: any } = {},
        options: MongomodSchemaSettings = { strict: false }
    ) {
        this.settings = {
            strict: options.strict || true
        };

        this.schema = new Schema(schemaObj)
    }

    validate(data: any) {
        return this.schema.validate(data)
    }
}

export default MongoSchema;