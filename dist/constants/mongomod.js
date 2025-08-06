export const MongomodErrCodes = {
    WrongInstance: 'WrongInstance',
    WrongSchema: 'WrongSchema',
    ReservedMethodName: 'ReservedMethodName',
    CustomMethodNotFunction: 'CustomMethodNotFunction',
    CustomMethodInvalidated: 'CustomMethodInvalidated',
    CannotUsedWithoutNew: 'CannotUsedWithoutNew'
};
export const MongomodErrMsgs = {
    WrongInstance: 'Provided db is not an instance of MongoConnection',
    WrongSchema: 'Provided schema is not an instance of MongoSchema',
    ReservedMethodName: `Method name is reserved for built-in methods`,
    CustomMethodNotFunction: 'Custom method is not a function',
    CustomMethodInvalidated: 'Custom methods validation failed',
    CannotUsedWithoutNew: 'Class constructor cannot be invoked without "new"'
};
