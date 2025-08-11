export const MmControllerErrors = {
    InvalidDb: {
        code: 'InvalidDb',
        message: 'Provided db is not a valid MongoConnection instance'
    },
    InvalidCollection: {
        code: 'InvalidCollection',
        message: 'Collection name must be a non-empty string'
    },
    NotConnected: {
        code: 'NotConnected',
        message: 'Database is not connected, cannot perform operation'
    }
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
