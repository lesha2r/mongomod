import { MmSubscribeEvents } from "../../constants/subscriber.js";
import MongoSubscriber from "../../MongoSubscriber/index.js";
type NewData = Record<string, any>;
type OldData = Record<string, any>;
declare function subscribe(this: MongoSubscriber, event: MmSubscribeEvents, callback: Function): void;
declare function onCreated(this: MongoSubscriber, newData: NewData, oldData: OldData): void;
declare function onUpdated(this: MongoSubscriber, newData: NewData, oldData: OldData): void;
declare function onDeleted(this: MongoSubscriber, newData: NewData, oldData: OldData): void;
declare const _default: {
    subscribe: typeof subscribe;
    onCreated: typeof onCreated;
    onUpdated: typeof onUpdated;
    onDeleted: typeof onDeleted;
};
export default _default;
