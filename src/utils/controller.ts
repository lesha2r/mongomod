import { ControllerErrCodes, ControllerErrMsgs } from "../constants/controller.js";
import { MmControllerError } from "../errors/controller.js";
import MongoConnection from "../MongoConnection.js";

export const validateControllerDb = (db: any) => {
    if (!db || !(db instanceof MongoConnection)) {
        throw new MmControllerError(
            ControllerErrCodes.InvalidDb,
            ControllerErrMsgs.InvalidDb,
            null
        );
    }
}

export const validateControllerCollection = (db: MongoConnection, collection: any) => {
    if (!collection || typeof collection !== 'string' || collection.length === 0) {
        throw new MmControllerError(
            ControllerErrCodes.InvalidCollection,
            ControllerErrMsgs.InvalidCollection,
            db.dbName || null
        );
    }
}