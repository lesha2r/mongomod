import { MmSubscribeEvents } from "../constants/subscriber.js";
type NewData = Record<string, any> | null;
type OldData = Record<string, any> | null;
declare class MongoSubscriber {
    id: string;
    constructor(id?: string);
    activeSubscribers: Record<string, Function[]>;
    private executeForCallbacks;
    subscribe: (event: MmSubscribeEvents, callback: Function) => void;
    onCreated: (newData: NewData, oldData: OldData) => void;
    onUpdated: (newData: NewData, oldData: OldData) => void;
    onDeleted: (newData: NewData, oldData: OldData) => void;
}
export default MongoSubscriber;
