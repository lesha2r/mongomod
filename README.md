# MongoMod

**A powerful MongoDB model-based library for Node.js with TypeScript support**

MongoMod is a feature-rich MongoDB ODM (Object Document Mapper) that provides an intuitive, model-based approach to working with MongoDB databases. It combines the flexibility of MongoDB with the structure and safety of schema validation, custom methods, and event-driven programming.

## 🚀 Features

- **Model-Based Architecture**: Define reusable models with schema validation
- **Schema Validation**: Built-in validation using the `validno` library
- **Custom Methods**: Extend models with your own custom functionality
- **Event System**: Subscribe to model lifecycle events (create, update, delete)
- **Full MongoDB Support**: Complete CRUD operations, aggregation, indexing, and more
- **TypeScript Support**: Full TypeScript definitions and type safety
- **Connection Management**: Robust connection handling with timeout and error management
- **Static & Instance Methods**: Flexible API for different use cases

## 📦 Installation

```bash
npm install mongomod
```

## 🔧 Quick Start

### 1. Basic Setup

```javascript
import mongomod from 'mongomod';

// Create connection
const db = new mongomod.Connection({
    link: 'your-mongo-host:27017',
    login: 'username',
    password: 'password',
    dbName: 'your-database',
    srv: false // Set to true for MongoDB Atlas
});

// Connect to database
await db.connect();
```

### 2. Define a Schema

```javascript
import { MongoSchema } from 'mongomod';

const userSchema = new MongoSchema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number, required: false },
    createdAt: { type: Date, default: Date.now }
});
```

### 3. Create a Model

```javascript
// Define custom methods
const customMethods = {
    getFullInfo() {
        return `${this.data().name} (${this.data().email})`;
    },
    
    isAdult() {
        return this.data().age >= 18;
    }
};

// Create the model
const User = mongomod.createModel({
    db: db,
    collection: 'users',
    schema: userSchema,
    customs: customMethods
});
```

### 4. Use the Model

```javascript
// Create and save a new user
const user = new User().init({
    name: 'John Doe',
    email: 'john@example.com',
    age: 25
});

await user.save(true); // true = insert if not exists

// Use custom methods
console.log(user.getFullInfo()); // "John Doe (john@example.com)"
console.log(user.isAdult()); // true

// Static methods for querying
const foundUser = await User.findOne({
    filter: { email: 'john@example.com' }
});

const allUsers = await User.findMany({
    filter: { age: { $gte: 18 } }
});
```

## 📚 Core Components

### MongoConnection

Handles database connections with robust error handling and timeout management.

```javascript
const connection = new mongomod.Connection({
    link: 'localhost:27017',
    login: 'username',
    password: 'password',
    dbName: 'myapp',
    srv: false
});

// Connect with optional callback and timeout
await connection.connect(() => {
    console.log('Connected successfully!');
}, 10000); // 10 second timeout

// Disconnect
await connection.disconnect();
```

### MongoSchema

Provides data validation and structure definition using the `validno` library.

```javascript
const schema = new MongoSchema({
    title: { type: String, required: true },
    content: { type: String },
    tags: { type: Array },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date }
}, {
    strict: true // Enforce strict validation
});

// Validate data
const isValid = schema.validate({
    title: 'My Post',
    content: 'Post content...'
});
```

### MongoController

Low-level database operations controller. Usually used internally by models, but can be used directly.

```javascript
const controller = new mongomod.Controller(db, 'posts');

// Direct database operations
const result = await controller.findMany({
    filter: { published: true },
    sort: { publishedAt: -1 },
    limit: 10
});
```

### MongoModel

The main model class that combines schema validation, custom methods, and database operations.

```javascript
class BlogPost extends MongoModel {
    // Models automatically inherit all controller methods
    // and can be extended with custom functionality
}

// Or use the factory method
const Post = mongomod.createModel({
    db: connection,
    collection: 'posts',
    schema: postSchema,
    customs: {
        publish() {
            this.set({ 
                published: true, 
                publishedAt: new Date() 
            });
            return this.save();
        }
    }
});
```

## 🔍 Model Methods

### Instance Methods

```javascript
const user = new User();

// Initialize with data
user.init({ name: 'Alice', age: 30 });

// Set/update data
user.set({ age: 31 });

// Save to database
await user.save(); // Update existing
await user.save(true); // Insert if not exists

// Get data from database
await user.get({ name: 'Alice' });

// Delete from database
await user.delete();

// Validation
const isValid = user.validate();

// Data access
const userData = user.data();
const filteredData = user.dataFiltered(['name', 'email']);

// String representation
const jsonString = user.toString();
```

### Static Methods (Query Methods)

```javascript
// Find operations
const user = await User.findOne({
    filter: { email: 'user@example.com' }
});

const users = await User.findMany({
    filter: { age: { $gte: 18 } },
    sort: { name: 1 },
    limit: 50
});

// Insert operations
const result = await User.insertOne({
    data: { name: 'Bob', email: 'bob@example.com', age: 25 }
});

const results = await User.insertMany({
    data: [
        { name: 'Carol', email: 'carol@example.com', age: 28 },
        { name: 'Dave', email: 'dave@example.com', age: 32 }
    ]
});

// Update operations
await User.updateOne({
    filter: { name: 'Bob' },
    update: { $set: { age: 26 } }
});

await User.updateMany({
    filter: { age: { $lt: 18 } },
    update: { $set: { status: 'minor' } }
});

// Delete operations
await User.deleteOne({
    filter: { email: 'user@example.com' }
});

await User.deleteMany({
    filter: { status: 'inactive' }
});

// Aggregation
const results = await User.aggregate([
    { $match: { age: { $gte: 18 } } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
]);

// Count documents
const count = await User.count({
    filter: { status: 'active' }
});

// Get distinct values
const distinctAges = await User.distinct({
    field: 'age',
    filter: { status: 'active' }
});

// Bulk operations
await User.bulkWrite({
    operations: [
        { insertOne: { document: { name: 'Eve', age: 22 } } },
        { updateOne: { filter: { name: 'Alice' }, update: { $inc: { age: 1 } } } },
        { deleteOne: { filter: { status: 'deleted' } } }
    ]
});
```

## 🎯 Event System

Subscribe to model lifecycle events to trigger custom logic:

```javascript
// Subscribe to events
User.subscribe('created', (newData, oldData) => {
    console.log('New user created:', newData);
    // Send welcome email, update analytics, etc.
});

User.subscribe('updated', (newData, oldData) => {
    console.log('User updated:', { old: oldData, new: newData });
    // Log changes, notify users, etc.
});

User.subscribe('deleted', (deletedData) => {
    console.log('User deleted:', deletedData);
    // Cleanup related data, send notifications, etc.
});

// Events are automatically triggered during operations
const user = new User().init({ name: 'Test User', age: 25 });
await user.save(true); // Triggers 'created' event

user.set({ age: 26 });
await user.save(); // Triggers 'updated' event

await user.delete(); // Triggers 'deleted' event
```

## 🛠️ Advanced Usage

### Custom Connection Options

```javascript
const connection = new mongomod.Connection({
    link: 'cluster0.mongodb.net',
    login: 'username',
    password: 'password',
    dbName: 'production',
    srv: true // Enable for MongoDB Atlas
});

// Connect with custom timeout
await connection.connect(
    () => console.log('Connected!'),
    15000 // 15 second timeout
);
```

### Complex Schema Validation

```javascript
const productSchema = new MongoSchema({
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, enum: ['electronics', 'clothing', 'books'] },
    tags: { type: Array, default: [] },
    inStock: { type: Boolean, default: true },
    metadata: {
        weight: { type: Number },
        dimensions: {
            length: { type: Number },
            width: { type: Number },
            height: { type: Number }
        }
    }
}, { strict: true });
```

### Model Inheritance and Extension

```javascript
// Base model with common functionality
const baseCustoms = {
    // Add timestamps
    touch() {
        this.set({ updatedAt: new Date() });
        return this;
    },
    
    // Soft delete
    softDelete() {
        this.set({ deletedAt: new Date(), active: false });
        return this.save();
    }
};

// Create specialized models
const User = mongomod.createModel({
    db: connection,
    collection: 'users',
    schema: userSchema,
    customs: {
        ...baseCustoms,
        authenticate(password) {
            // User-specific authentication logic
            return bcrypt.compare(password, this.data().passwordHash);
        }
    }
});

const Product = mongomod.createModel({
    db: connection,
    collection: 'products',
    schema: productSchema,
    customs: {
        ...baseCustoms,
        applyDiscount(percentage) {
            const currentPrice = this.data().price;
            const newPrice = currentPrice * (1 - percentage / 100);
            this.set({ price: newPrice });
            return this.save();
        }
    }
});
```

## 🔒 Error Handling

MongoMod provides specific error types for different scenarios:

```javascript
import { 
    MmConnectionError, 
    MmValidationError, 
    MmOperationError, 
    MmControllerError 
} from 'mongomod';

try {
    await db.connect();
} catch (error) {
    if (error instanceof MmConnectionError) {
        console.error('Connection failed:', error.message);
    }
}

try {
    const user = new User().init({ name: 'Test' }); // Missing required field
} catch (error) {
    if (error instanceof MmValidationError) {
        console.error('Validation failed:', error.message);
    }
}
```

## ⚠️ Version 2.0+ Breaking Changes

**IMPORTANT:** Version 2.0.0 introduces breaking changes and is **NOT backward compatible** with versions prior to 2.0.0.

### Migration Guide

- Update import statements to use ES modules
- Review schema definitions for new validation syntax
- Update custom method definitions to use the new binding system
- Check event subscriber syntax for any changes

## 📝 API Reference

### mongomod

- `createModel(options)` - Create a new model class
- `Connection` - Database connection class
- `Controller` - Database operations controller
- `Model` - Base model class
- `Schema` - Schema validation class

### Connection Options

```typescript
interface MongomodConnectionOptions {
    link: string;      // MongoDB host:port
    login: string;     // Username
    password: string;  // Password
    dbName: string;    // Database name
    srv: boolean;      // Use MongoDB Atlas SRV connection
}
```

### Model Options

```typescript
interface MongoModelOptions {
    db: MongoConnection;           // Database connection
    collection: string;            // Collection name
    schema?: MongoSchema;          // Optional schema
    customs?: Record<string, Function>; // Custom methods
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🔗 Links

- [GitHub Repository](https://github.com/lesha2r/mongomod)
- [NPM Package](https://www.npmjs.com/package/mongomod)
- [Issues](https://github.com/lesha2r/mongomod/issues)