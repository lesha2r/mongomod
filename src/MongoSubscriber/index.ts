import { MmSubscribeEvents, MmSubscriberErrCodes, MmSubscriberErrMsgs, SubscriberOperationName } from "../constants/subscriber.js";
import { MmValidationError } from "../errors/validationError.js";
import { MongoSubscriberEvents } from "../types/subscriber.js";

type NewData = Record<string, any> | null
type OldData = Record<string, any> | null

class MongoSubscriber {
    id: string;

    constructor(id?: string) {
        this.id = id || ''
    }

    activeSubscribers: Record<string, Function[]> = {
        [MmSubscribeEvents.Created]: [],
        [MmSubscribeEvents.Updated]: [],
        [MmSubscribeEvents.Deleted]: [],
    }

    private executeForCallbacks(callbacks: Function[], newData: NewData, oldData: OldData) {
        for (const fn of callbacks) {
            fn(newData, oldData)
        }
    }

    subscribe = (event: MmSubscribeEvents, callback: Function) => {
        if (typeof callback !== 'function') {
            throw new MmValidationError({
                code: MmSubscriberErrCodes.NotAFunction,
                message: MmSubscriberErrMsgs.NotAFunction,
                operation: SubscriberOperationName
            })
        }

        if (event in this.activeSubscribers === false) return;
        
        this.activeSubscribers[event].push(callback)
    }

    onCreated = (newData: NewData, oldData: OldData) => {
        const callbacks = this.activeSubscribers[MmSubscribeEvents.Created]
        this.executeForCallbacks(callbacks, newData, oldData)
    }

    onUpdated = (newData: NewData, oldData: OldData) => {
        const callbacks = this.activeSubscribers[MmSubscribeEvents.Updated]
        this.executeForCallbacks(callbacks, newData, oldData)
    }

    onDeleted = (newData: NewData, oldData: OldData) => {
        const callbacks = this.activeSubscribers[MmSubscribeEvents.Deleted]
        this.executeForCallbacks(callbacks, newData, oldData)
    }
}

export default MongoSubscriber