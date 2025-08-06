import { MmSubscribeEvents } from "../../constants/subscriber.js";
type NewData = Record<string, any>;
type OldData = Record<string, any>;
interface ICustomModel {
    activeSubscribers: {
        [MmSubscribeEvents.Created]: Function[];
        [MmSubscribeEvents.Updated]: Function[];
        [MmSubscribeEvents.Deleted]: Function[];
    };
}
declare function subscribe(this: ICustomModel, event: MmSubscribeEvents, callback: Function): void;
declare function onCreated(this: ICustomModel, newData: NewData, oldData: OldData): void;
declare function onUpdated(this: ICustomModel, newData: NewData, oldData: OldData): void;
declare function onDeleted(this: ICustomModel, newData: NewData, oldData: OldData): void;
declare const _default: {
    subscribe: typeof subscribe;
    onCreated: typeof onCreated;
    onUpdated: typeof onUpdated;
    onDeleted: typeof onDeleted;
};
export default _default;
