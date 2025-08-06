import { MmControllerErrCodes, MmControllerErrMsgs } from "../constants/controller.js";
import { MmControllerError } from "../errors/controllerError.js";
import MongoConnection from "../MongoConnection/index.js";
export const validateControllerDb = (db) => {
    if (!db || !(db instanceof MongoConnection)) {
        throw new MmControllerError({
            code: MmControllerErrCodes.InvalidDb,
            message: MmControllerErrMsgs.InvalidDb,
            dbName: null
        });
    }
};
export const validateControllerCollection = (db, collection) => {
    if (!collection || typeof collection !== 'string' || collection.length === 0) {
        throw new MmControllerError({
            code: MmControllerErrCodes.InvalidCollection,
            message: MmControllerErrMsgs.InvalidCollection,
            dbName: db.dbName || null
        });
    }
};
