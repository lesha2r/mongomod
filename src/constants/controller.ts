export const ControllerErrCodes = {
    InvalidDb: 'InvalidDb',
    InvalidCollection: 'InvalidCollection',
    NotConnected: 'NotConnected',
}

export const ControllerErrMsgs = {
    InvalidDb: 'Provided db is not a valid MongoConnection instance',
    InvalidCollection: 'Collection name must be a non-empty string',
    NotConnected: 'Database is not connected, cannot perform operation',
}