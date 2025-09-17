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
        const specificCallbacks = this.activeSubscribers[MmSubscribeEvents.Created];
        for (const fn of specificCallbacks) {
            fn(newData, oldData);
        }
        const allCallbacks = this.activeSubscribers[MmSubscribeEvents.All];
        for (const fn of allCallbacks) {
            fn(newData, oldData, MmSubscribeEvents.Created);
        }
    };
    onUpdated = (newData, oldData) => {
        const specificCallbacks = this.activeSubscribers[MmSubscribeEvents.Updated];
        for (const fn of specificCallbacks) {
            fn(newData, oldData);
        }
        const allCallbacks = this.activeSubscribers[MmSubscribeEvents.All];
        for (const fn of allCallbacks) {
            fn(newData, oldData, MmSubscribeEvents.Updated);
        }
    };
    onDeleted = (newData, oldData) => {
        const specificCallbacks = this.activeSubscribers[MmSubscribeEvents.Deleted];
        for (const fn of specificCallbacks) {
            fn(newData, oldData);
        }
        const allCallbacks = this.activeSubscribers[MmSubscribeEvents.All];
        for (const fn of allCallbacks) {
            fn(newData, oldData, MmSubscribeEvents.Deleted);
        }
    };
}
export default MongoSubscriber;
