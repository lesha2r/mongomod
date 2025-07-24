export const ConnectErrCodes = {
    InvalidOptions: 'InvalidOptions',
    NotConnected: 'NotConnected',
    ConnectCallbackFunction: 'ConnectCallbackFunction',
    ConnectionFailed: 'ConnectionFailed',
    CloseConnectionFailed: 'CloseConnectionFailed',
    ConnectionTimeout: 'ConnectionTimeout'
}

export const ConnectErrMsgs = {
    InvalidOptions: 'Invalid connection options',
    NotConnected: 'MongoDB client is not connected',
    ConnectCallbackFunction: 'Connect callback must be a function',
    ConnectionFailed: 'Failed to establish connection to MongoDB',
    CloseConnectionFailed: 'Failed to close connection to MongoDB',
    ConnectionTimeout: 'Connection to MongoDB timed out'
}