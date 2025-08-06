export const MmControllerErrCodes = {
    InvalidDb: 'InvalidDb',
    InvalidCollection: 'InvalidCollection',
    NotConnected: 'NotConnected',
};
export const MmControllerErrMsgs = {
    InvalidDb: 'Provided db is not a valid MongoConnection instance',
    InvalidCollection: 'Collection name must be a non-empty string',
    NotConnected: 'Database is not connected, cannot perform operation',
};
export const MmControllerOperations = {
    Aggregate: 'aggregate',
    FindOne: 'findOne',
    FindMany: 'findMany',
    InsertOne: 'insertOne',
    UpdateOne: 'updateOne',
    DeleteOne: 'deleteOne',
    EnsureIndex: 'ensureIndex',
    UpdateMany: 'updateMany',
    InsertMany: 'insertMany',
    BulkWrite: 'bulkWrite',
    DeleteMany: 'deleteMany',
    Count: 'count',
    Distinct: 'distinct'
};
