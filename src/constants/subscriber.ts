export enum MmSubscribeEvents {
    Created = 'created',
    Updated = 'updated',
    Deleted = 'deleted',
    All = '*'
}

export const SubscriberOperationName = 'subscribe'

export const MmSubscriberErrCodes = {
    NotAFunction: 'NotAFunction',
}

export const MmSubscriberErrMsgs = {
    NotAFunction: 'Callback is not a function',
}