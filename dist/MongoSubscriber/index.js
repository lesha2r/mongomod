import { MmSubscribeEvents, MmSubscriberErrCodes, MmSubscriberErrMsgs, SubscriberOperationName } from "../constants/subscriber.js";
import { MmValidationError } from "../errors/validationError.js";
class MongoSubscriber {
    id;
    constructor(id) {
        this.id = id || '';
    }
    activeSubscribers = {
        [MmSubscribeEvents.Created]: [],
        [MmSubscribeEvents.Updated]: [],
        [MmSubscribeEvents.Deleted]: [],
        [MmSubscribeEvents.All]: []
    };
    executeForCallbacks(callbacks, eventName, newData, oldData) {
        for (const fn of callbacks) {
            fn(newData, oldData, eventName);
        }
    }
    subscribe = (event, callback) => {
        if (typeof callback !== 'function') {
            throw new MmValidationError({
                code: MmSubscriberErrCodes.NotAFunction,
                message: MmSubscriberErrMsgs.NotAFunction,
                operation: SubscriberOperationName
            });
        }
        if (event in this.activeSubscribers === false)
            return;
        this.activeSubscribers[event].push(callback);
    };
    onCreated = (newData, oldData) => {
        const callbacks = [
            ...this.activeSubscribers[MmSubscribeEvents.Created],
            ...this.activeSubscribers[MmSubscribeEvents.All]
        ];
        this.executeForCallbacks(callbacks, MmSubscribeEvents.Created, newData, oldData);
    };
    onUpdated = (newData, oldData) => {
        const callbacks = [
            ...this.activeSubscribers[MmSubscribeEvents.Updated],
            ...this.activeSubscribers[MmSubscribeEvents.All]
        ];
        this.executeForCallbacks(callbacks, MmSubscribeEvents.Updated, newData, oldData);
    };
    onDeleted = (newData, oldData) => {
        const callbacks = [
            ...this.activeSubscribers[MmSubscribeEvents.Deleted],
            ...this.activeSubscribers[MmSubscribeEvents.All]
        ];
        this.executeForCallbacks(callbacks, MmSubscribeEvents.Deleted, newData, oldData);
    };
}
export default MongoSubscriber;
