import { MmSubscribeEvents, MmSubscriberErrCodes, MmSubscriberErrMsgs, SubscriberOperationName } from "../../constants/subscriber.js";
import { MmValidationError } from "../../errors/validationError.js";
const executeForCallbacks = (callbacks, newData, oldData) => {
    for (const fn of callbacks) {
        fn(newData, oldData);
    }
};
function subscribe(event, callback) {
    if (event in this.activeSubscribers === false)
        return;
    if (typeof callback !== 'function') {
        throw new MmValidationError({
            code: MmSubscriberErrCodes.NotAFunction,
            message: MmSubscriberErrMsgs.NotAFunction,
            operation: SubscriberOperationName
        });
    }
    this.activeSubscribers[event].push(callback);
}
function onCreated(newData, oldData) {
    const callbacks = [
        ...this.activeSubscribers[MmSubscribeEvents.Created],
        ...this.activeSubscribers[MmSubscribeEvents.All]
    ];
    executeForCallbacks(callbacks, newData, oldData);
}
function onUpdated(newData, oldData) {
    const callbacks = [
        ...this.activeSubscribers[MmSubscribeEvents.Updated],
        ...this.activeSubscribers[MmSubscribeEvents.All]
    ];
    executeForCallbacks(callbacks, newData, oldData);
}
function onDeleted(newData, oldData) {
    const callbacks = [
        ...this.activeSubscribers[MmSubscribeEvents.Deleted],
        ...this.activeSubscribers[MmSubscribeEvents.All]
    ];
    executeForCallbacks(callbacks, newData, oldData);
}
export default {
    subscribe,
    onCreated,
    onUpdated,
    onDeleted
};
