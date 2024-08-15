export type TMethodResult = {
    ok: boolean,
    result: {[key: string]: any}|{[key: string]: any}[],
    details?: string
    error?: string
}