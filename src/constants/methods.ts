import { ReservedMethod } from "../types/methods.js";

export const MmMethods = {
    Validate: 'validate',
    ClearBySchema: 'clearBySchema',
    Init: 'init',
    Set: 'set',
    Insert: 'insert',
    Get: 'get',
    Save: 'save',
    Delete: 'delete'
}

export const MmMethodsNames: ReservedMethod[] = [
    MmMethods.Validate,
    MmMethods.ClearBySchema,
    MmMethods.Init,
    MmMethods.Set,
    MmMethods.Insert,
    MmMethods.Get,
    MmMethods.Save,
    MmMethods.Delete,
];