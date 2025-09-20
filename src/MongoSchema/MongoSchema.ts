import Schema from 'validno'

type MongomodSchemaSettings = { strict: boolean }

const validateSchemaInput = (input: any) => {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
        throw new Error('Schema definition must be a non-null object')
    }
}

class MongoSchema {
    settings: MongomodSchemaSettings
    schema: typeof Schema

    constructor(
        schemaObj: { [key: string]: any } = {},
        options: MongomodSchemaSettings = { strict: false }
    ) {
        validateSchemaInput(schemaObj)

        this.settings = {
            strict: options.strict || true
        };

        this.schema = new Schema(schemaObj)
    }

    validate(data: any, fields?: string | string[]) {
        return this.schema.validate(data, fields || undefined)
    }
}

export default MongoSchema;