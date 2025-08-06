export var MmSubscribeEvents;
(function (MmSubscribeEvents) {
    MmSubscribeEvents["Created"] = "created";
    MmSubscribeEvents["Updated"] = "updated";
    MmSubscribeEvents["Deleted"] = "deleted";
})(MmSubscribeEvents || (MmSubscribeEvents = {}));
export const SubscriberOperationName = 'subscribe';
export const MmSubscriberErrCodes = {
    NotAFunction: 'NotAFunction',
};
export const MmSubscriberErrMsgs = {
    NotAFunction: 'Callback is not a function',
};
