export const MmConnectionErrors = {
    InvalidOptions: {
        code: 'InvalidOptions',
        message: 'Invalid connection options'
    },
    NotConnected: {
        code: 'NotConnected',
        message: 'MongoDB client is not connected'
    },
    ConnectCallbackFunction: {
        code: 'ConnectCallbackFunction',
        message: 'Connect callback must be a function'
    },
    ConnectionFailed: {
        code: 'ConnectionFailed',
        message: 'Failed to establish connection to MongoDB'
    },
    CloseConnectionFailed: {
        code: 'CloseConnectionFailed',
        message: 'Failed to close connection to MongoDB'
    },
    ConnectionTimeout: {
        code: 'ConnectionTimeout',
        message: 'Connection to MongoDB timed out'
    }
};
