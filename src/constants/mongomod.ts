export const MongomodErrorCodes = {
    WrongInstance: 'WrongInstance',
    WrongSchema: 'WrongSchema',
    ReservedMethodName: 'ReservedMethodName',
    CustomMethodNotFunction: 'CustomMethodNotFunction',
    CannotUsedWithoutNew: 'CannotUsedWithoutNew'
}
export const MongomodErrorMessages = {
    WrongInstance: 'Provided db is not an instance of MongoConnection',
    WrongSchema: 'Provided schema is not an instance of MongoSchema',
    ReservedMethodName: `Method name is reserved for built-in methods`,
    CustomMethodNotFunction: 'Custom method is not a function',
    CannotUsedWithoutNew: 'Class constructor cannot be invoked without "new"'
}