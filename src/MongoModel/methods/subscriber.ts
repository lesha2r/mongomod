import { MmSubscribeEvents, MmSubscriberErrCodes, MmSubscriberErrMsgs, SubscriberOperationName } from "../../constants/subscriber.js";
import { MmValidationError } from "../../errors/validationError.js";

type NewData = Record<string, any>
type OldData = Record<string, any>

interface ICustomModel {
    activeSubscribers: {
        [MmSubscribeEvents.Created]: Function[],
        [MmSubscribeEvents.Updated]: Function[],
        [MmSubscribeEvents.Deleted]: Function[],
    }
}

const executeForCallbacks = (callbacks: Function[], newData: NewData, oldData: OldData) => {
    for (const fn of callbacks) {
        fn(newData, oldData)
    }
}

function subscribe(this: ICustomModel, event: MmSubscribeEvents, callback: Function) {
    if (event in this.activeSubscribers === false) return;
    
    if (typeof callback !== 'function') {
        throw new MmValidationError({
            code: MmSubscriberErrCodes.NotAFunction,
            message: MmSubscriberErrMsgs.NotAFunction,
            operation: SubscriberOperationName
        })
    }

    this.activeSubscribers[event].push(callback)
}

function onCreated(this: ICustomModel, newData: NewData, oldData: OldData) {
    const callbacks = this.activeSubscribers[MmSubscribeEvents.Created]
    executeForCallbacks(callbacks, newData, oldData)
}

function onUpdated(this: ICustomModel, newData: NewData, oldData: OldData) {
    const callbacks = this.activeSubscribers[MmSubscribeEvents.Created]
    executeForCallbacks(callbacks, newData, oldData)
}

function onDeleted(this: ICustomModel, newData: NewData, oldData: OldData) {
    const callbacks = this.activeSubscribers[MmSubscribeEvents.Created]
    executeForCallbacks(callbacks, newData, oldData)
}

export default {
    subscribe,
    onCreated,
    onUpdated,
    onDeleted
}