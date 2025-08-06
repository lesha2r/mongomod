import { MmMethods } from "../constants/methods.js"

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