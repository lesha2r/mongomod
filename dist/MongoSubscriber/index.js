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
    };
    executeForCallbacks(callbacks, newData, oldData) {
        for (const fn of callbacks) {
            fn(newData, oldData);
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
        const callbacks = this.activeSubscribers[MmSubscribeEvents.Created];
        this.executeForCallbacks(callbacks, newData, oldData);
    };
    onUpdated = (newData, oldData) => {
        const callbacks = this.activeSubscribers[MmSubscribeEvents.Updated];
        this.executeForCallbacks(callbacks, newData, oldData);
    };
    onDeleted = (newData, oldData) => {
        const callbacks = this.activeSubscribers[MmSubscribeEvents.Deleted];
        this.executeForCallbacks(callbacks, newData, oldData);
    };
}
export default MongoSubscriber;
