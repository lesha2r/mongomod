export const ModelErrCodes = {
    InvalidModelData: 'InvalidModelData',
    ModelDataEmpty: 'ModelDataEmpty',
    DeleteFailed: 'DeleteFailed',
    MissingId: 'MissingId',
    SaveFailed: 'SaveFailed',
    InsertFailed: 'InsertFailed',
    GetFailed: 'GetFailed',
}

export const ModelErrMsgs = {
    InvalidModelData: 'Provided modelData is not valid according to the schema',
    ModelDataEmpty: 'Model data is empty, cannot perform operation',
    DeleteFailed: 'Failed to delete model from database',
    MissingId: 'Model _id is required for this operation',
    SaveFailed: 'Failed to save model to database',
    InsertFailed: 'Failed to insert model into database',
    GetFailed: 'Failed to retrieve model from database',
}
