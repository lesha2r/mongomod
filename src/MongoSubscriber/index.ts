import { MmSubscribeEvents, MmSubscriberErrCodes, MmSubscriberErrMsgs, SubscriberOperationName } from "../constants/subscriber.js";
import { MmValidationError } from "../errors/validationError.js";

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
        [MmSubscribeEvents.All]: []
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
        // Execute specific event callbacks (only newData, oldData)
        const specificCallbacks = this.activeSubscribers[MmSubscribeEvents.Created]
        for (const fn of specificCallbacks) {
            fn(newData, oldData)
        }
        
        // Execute '*' event callbacks (newData, oldData, eventName)
        const allCallbacks = this.activeSubscribers[MmSubscribeEvents.All]
        for (const fn of allCallbacks) {
            fn(newData, oldData, MmSubscribeEvents.Created)
        }
    }

    onUpdated = (newData: NewData, oldData: OldData) => {
        // Execute specific event callbacks (only newData, oldData)
        const specificCallbacks = this.activeSubscribers[MmSubscribeEvents.Updated]
        for (const fn of specificCallbacks) {
            fn(newData, oldData)
        }
        
        // Execute '*' event callbacks (newData, oldData, eventName)
        const allCallbacks = this.activeSubscribers[MmSubscribeEvents.All]
        for (const fn of allCallbacks) {
            fn(newData, oldData, MmSubscribeEvents.Updated)
        }
    }

    onDeleted = (newData: NewData, oldData: OldData) => {
        // Execute specific event callbacks (only newData, oldData)
        const specificCallbacks = this.activeSubscribers[MmSubscribeEvents.Deleted]
        for (const fn of specificCallbacks) {
            fn(newData, oldData)
        }
        
        // Execute '*' event callbacks (newData, oldData, eventName)
        const allCallbacks = this.activeSubscribers[MmSubscribeEvents.All]
        for (const fn of allCallbacks) {
            fn(newData, oldData, MmSubscribeEvents.Deleted)
        }
    }
}

export default MongoSubscriber