<!-- ✅ checked @ 16.09.2025 -->
# MongoConnection

The `MongoConnection` class handles database connections with robust error handling and timeout management.

## Constructor

```javascript
const connection = new mongomod.Connection(options);
```

### Options

<!--@include: ../includes/connection-options.md-->

## Methods

### `connect(callback?, timeout?)`

Establishes a connection to the MongoDB database.

```javascript
// Basic connection
await connection.connect();

// With callback
await connection.connect(() => {
    console.log('Connected successfully!');
});

// With timeout (in milliseconds)
await connection.connect(null, 10000); // 10 second timeout

// With both callback and timeout
await connection.connect(() => {
    console.log('Connected!');
}, 15000);
```

**Parameters:**
- `callback` (optional): Function to execute after successful connection
- `timeout` (optional): Connection timeout in milliseconds

**Throws:** `MmConnectionError` if connection fails

### `disconnect()`

Closes the database connection.

```javascript
await connection.disconnect();
```

**Returns:** Promise that resolves when disconnection is complete

## Properties

### `db`

Access to the underlying MongoDB database instance.

```javascript
const database = connection.db();
// Use native MongoDB operations if needed
const collection = database.collection('users');
```

### `client`

Access to the underlying MongoDB client instance.

```javascript
const client = connection.client;
// Access client-level operations
```

### `isConnected`

Checks if the connection is currently active.

```javascript
const isConnected = connection.isConnected;
console.log('Connected:', isConnected); // true or false
```

**Returns:** Boolean indicating connection status

## Examples

### Authenticated Connection

```javascript
const connection = new mongomod.Connection({
    link: 'localhost:27017',
    login: 'myuser',
    password: 'mypassword',
    dbName: 'myapp'
});

await connection.connect();
```

### MongoDB Atlas Connection

```javascript
const connection = new mongomod.Connection({
    link: 'cluster0.example.mongodb.net',
    login: 'username',
    password: 'password',
    dbName: 'myapp',
    srv: true  // Important for Atlas
});

await connection.connect();
```

### Connection with Error Handling

```javascript
import { MmConnectionError } from 'mongomod';

try {
    const connection = new mongomod.Connection({
        link: 'localhost:27017',
        dbName: 'myapp'
    });
    
    await connection.connect(() => {
        console.log('Database connected successfully!');
    }, 10000);
    
} catch (error) {
    if (error instanceof MmConnectionError) {
        console.error('Connection failed:', error.message);
        // Handle connection error
    }
}
```

### Connection Lifecycle Management

```javascript
class DatabaseManager {
    constructor() {
        this.connection = new mongomod.Connection({
            link: process.env.MONGO_HOST || 'localhost:27017',
            login: process.env.MONGO_USER,
            password: process.env.MONGO_PASSWORD,
            dbName: process.env.MONGO_DB || 'myapp'
        });
    }
    
    async connect() {
        if (!this.connection.isConnected) {
            await this.connection.connect();
            console.log('Database connected');
        }
    }
    
    async disconnect() {
        if (this.connection.isConnected) {
            await this.connection.disconnect();
            console.log('Database disconnected');
        }
    }
    
    getDatabase() {
        return this.connection.db;
    }
}

// Usage
const dbManager = new DatabaseManager();
await dbManager.connect();

// ... use database ...

// Cleanup
process.on('SIGINT', async () => {
    await dbManager.disconnect();
    process.exit(0);
});
```

## Best Practices

### Environment Variables

Store connection details in environment variables:

```javascript
const connection = new mongomod.Connection({
    link: process.env.MONGODB_URI || 'localhost:27017',
    login: process.env.MONGODB_USER,
    password: process.env.MONGODB_PASSWORD,
    dbName: process.env.MONGODB_DATABASE,
    srv: process.env.MONGODB_SRV === 'true'
});
```

### Connection Pooling

MongoMod automatically handles connection pooling through the underlying MongoDB driver. You can configure pool settings by accessing the client.

### Error Handling

Always wrap connection attempts in try-catch blocks:

```javascript
try {
    await connection.connect();
} catch (error) {
    console.error('Connection failed:', error.message);
    // Implement retry logic or fallback
}
```

### Graceful Shutdown

Ensure connections are properly closed when your application shuts down:

```javascript
process.on('SIGTERM', async () => {
    await connection.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await connection.disconnect();
    process.exit(0);
});
```

## Related

- [MongoModel](/core-components/mongo-model) - Uses connections for model operations
- [MongoController](/core-components/mongo-controller) - Low-level operations using connections
- [Error Handling](/error-handling) - Connection error management