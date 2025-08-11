import { MmControllerErrors } from "../constants/controller.js";
import { MmControllerError } from "../errors/controllerError.js";
import MongoConnection from "../MongoConnection/index.js";
export const validateControllerDb = (db) => {
    if (!db || !(db instanceof MongoConnection)) {
        throw new MmControllerError({
            code: MmControllerErrors.InvalidDb.code,
            message: MmControllerErrors.InvalidDb.message,
            dbName: null
        });
    }
};
export const validateControllerCollection = (db, collection) => {
    if (!collection || typeof collection !== 'string' || collection.length === 0) {
        throw new MmControllerError({
            code: MmControllerErrors.InvalidCollection.code,
            message: MmControllerErrors.InvalidCollection.message,
            dbName: db.dbName || null
        });
    }
};
