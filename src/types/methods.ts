import { MmMethods } from "../constants/methods.js"

export type MethodResult = {
    ok: boolean,
    result: {[key: string]: any}|{[key: string]: any}[],
    details?: string
    error?: string
}

export type ReservedMethod = 
    typeof MmMethods.Validate |
    typeof MmMethods.ClearBySchema |
    typeof MmMethods.Init |
    typeof MmMethods.Set |
    typeof MmMethods.Insert |
    typeof MmMethods.Get |
    typeof MmMethods.Save |
    typeof MmMethods.Delete |
    'models'