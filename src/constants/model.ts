import { ErrorConst } from "../types/errors.js";
import { ReservedMethod } from "../types/methods.js";

export const MmModelErrors: ErrorConst = {
    InvalidModelData: {
        code: 'InvalidModelData',
        message: 'Provided modelData is not valid according to the schema'
    },
    ModelDataEmpty: {
        code: 'ModelDataEmpty',
        message: 'Model data is empty, cannot perform operation'
    },
    DeleteFailed: {
        code: 'DeleteFailed',
        message: 'Failed to delete model from database'
    },
    MissingId: {
        code: 'MissingId',
        message: 'Model _id is required for this operation'
    },
    SaveFailed: {
        code: 'SaveFailed',
        message: 'Failed to save model to database'
    },
    InsertFailed: {
        code: 'InsertFailed',
        message: 'Failed to insert model into database'
    },
    GetFailed: {
        code: 'GetFailed',
        message: 'Failed to retrieve model from database'
    },
}

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
}

export const MmMethodNames: ReservedMethod[] = [
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