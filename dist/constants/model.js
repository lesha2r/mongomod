export const MmModelErrCodes = {
    InvalidModelData: 'InvalidModelData',
    ModelDataEmpty: 'ModelDataEmpty',
    DeleteFailed: 'DeleteFailed',
    MissingId: 'MissingId',
    SaveFailed: 'SaveFailed',
    InsertFailed: 'InsertFailed',
    GetFailed: 'GetFailed',
};
export const MmModelErrMsgs = {
    InvalidModelData: 'Provided modelData is not valid according to the schema',
    ModelDataEmpty: 'Model data is empty, cannot perform operation',
    DeleteFailed: 'Failed to delete model from database',
    MissingId: 'Model _id is required for this operation',
    SaveFailed: 'Failed to save model to database',
    InsertFailed: 'Failed to insert model into database',
    GetFailed: 'Failed to retrieve model from database',
};
export const MmMethods = {
    Data: 'data',
    DataFilterd: 'dataFiltered',
    ToString: 'toString',
    Validate: 'validate',
    Init: 'init',
    ClearBySchema: 'clearBySchema',
    Set: 'set',
    Insert: 'insert',
    Get: 'get',
    Save: 'save',
    Delete: 'delete'
};
export const MmMethodNames = [
    MmMethods.Data,
    MmMethods.DataFilterd,
    MmMethods.ToString,
    MmMethods.Validate,
    MmMethods.Init,
    MmMethods.ClearBySchema,
    MmMethods.Set,
    MmMethods.Insert,
    MmMethods.Get,
    MmMethods.Save,
    MmMethods.Delete,
];
