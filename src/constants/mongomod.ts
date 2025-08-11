import { ErrorConst } from "../types/errors.js";

export const MongomodErrors: ErrorConst = {
    WrongInstance: {
        code: 'WrongInstance',
        message: 'Provided db is not an instance of MongoConnection'
    },
    WrongSchema: {
        code: 'WrongSchema',
        message: 'Provided schema is not an instance of MongoSchema'
    },
    ReservedMethodName: {
        code: 'ReservedMethodName',
        message: `Method name is reserved for built-in methods`
    },
    CustomMethodNotFunction: {
        code: 'CustomMethodNotFunction',
        message: 'Custom method is not a function'
    },
    CustomMethodInvalidated: {
        code: 'CustomMethodInvalidated',
        message: 'Custom methods validation failed'
    },
    CannotUsedWithoutNew: {
        code: 'CannotUsedWithoutNew',
        message: 'Class constructor cannot be invoked without "new"'
    }
}