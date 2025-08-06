import { ControllerErrCodes, ControllerErrMsgs } from "../constants/controller.js";
import { MmControllerError } from "../errors/controllerError.js";
import MongoConnection from "../MongoConnection.js";

export const validateControllerDb = (db: any) => {
    if (!db || !(db instanceof MongoConnection)) {
        throw new MmControllerError({
            code: ControllerErrCodes.InvalidDb,
            message: ControllerErrMsgs.InvalidDb,
            dbName: null
        });
    }
}

export const validateControllerCollection = (db: MongoConnection, collection: any) => {
    if (!collection || typeof collection !== 'string' || collection.length === 0) {
        throw new MmControllerError({
            code: ControllerErrCodes.InvalidCollection,
            message: ControllerErrMsgs.InvalidCollection,
            dbName: db.dbName || null
        });
    }
}