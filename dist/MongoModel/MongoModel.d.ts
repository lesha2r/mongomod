import MongoSchema from "../MongoSchema/index.js";
import MongoController from "../MongoController/index.js";
import MongoConnection from "../MongoConnection/index.js";
export interface MongoModelOptions {
    db: MongoConnection;
    collection: string;
    schema?: MongoSchema;
    customs?: Record<string, Function>;
}
declare const MongoModelMethods: {
    FindOne: string;
    FindMany: string;
    InsertOne: string;
    UpdateOne: string;
    DeleteOne: string;
    UpdateMany: string;
    DeleteMany: string;
    InsertMany: string;
    Aggregate: string;
    Count: string;
    BulkWrite: string;
    Distinct: string;
};
export type MongoModelMethodNames = keyof typeof MongoModelMethods;
declare class MongoModel extends MongoController {
    [key: string]: any;
    db: MongoConnection;
    schema?: MongoSchema | null;
    collection: string;
    modelData: null | Record<string, any>;
    constructor(inputOptions: MongoModelOptions);
    protected _modelDataBeforeSave: Record<string, any> | null;
    protected ensureModelData(): boolean;
    protected ensureModelId(): boolean;
    data(clone?: boolean): Record<string, any> | null;
    dataFiltered(allowedKeys: string[]): {
        [key: string]: any;
    } | null;
    toString(): string;
    validate(data?: {
        [key: string]: any;
    } | null): any;
    init(data: Record<string, any>): MongoModel;
    clearBySchema(): MongoModel;
    set(data: Record<string, any>): MongoModel;
    insert(): Promise<MongoModel>;
    get(filter?: {
        [key: string]: any;
    }): Promise<MongoModel>;
    save(insertIfNotExists?: boolean): Promise<MongoModel>;
    delete(): Promise<MongoModel>;
}
export default MongoModel;
