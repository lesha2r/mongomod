# API Reference

Welcome to the complete MongoMod API reference. This section provides detailed documentation for all methods, properties, and configuration options.

## Core Classes

- [Connection](/core-concepts/connection) - Database connection management
- [Schema](/core-concepts/schema) - Data validation and structure
- [Controller](/core-concepts/controller) - Low-level database operations
- [Model](/core-concepts/model) - High-level model interface
- [Events](/core-concepts/events) - Event system

## Method Categories

### [Model Methods](/api-reference/model-methods)
Instance methods available on model objects for data manipulation and persistence.

### [Static Methods](/api-reference/static-methods) 
Static methods available on model classes for querying and bulk operations.

### [Schema Validation](/api-reference/schema-validation)
Comprehensive guide to schema definition and validation capabilities.

### [Event System](/api-reference/event-system)
Event subscription and handling for reactive programming patterns.

## Error Types

MongoMod provides specific error types for different failure scenarios:

- `MmConnectionError` - Database connection failures
- `MmValidationError` - Schema validation failures  
- `MmOperationError` - Database operation failures
- `MmControllerError` - Low-level controller failures

See [Error Handling](/advanced/error-handling) for detailed error management patterns.

## Quick Reference

### Basic Usage Pattern

```javascript
import mongomod from 'mongomod';

// 1. Create connection
const db = new mongomod.Connection({
    link: 'localhost:27017',
    dbName: 'myapp'
});
await db.connect();

// 2. Define schema
const schema = new mongomod.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true }
});

// 3. Create model
const User = mongomod.createModel({
    db: db,
    collection: 'users', 
    schema: schema,
    customs: {
        greet() {
            return `Hello, ${this.data().name}!`;
        }
    }
});

// 4. Use model
const user = new User().init({
    name: 'John Doe',
    email: 'john@example.com'
});

await user.save();
console.log(user.greet()); // "Hello, John Doe!"
```

### Common Operations

```javascript
// Create
const user = new User().init(userData);
await user.save();

// Read
const user = await User.findOne({ filter: { email: 'user@example.com' } });
const users = await User.findMany({ filter: { active: true } });

// Update
user.set({ age: 26 });
await user.save();

// Delete  
await user.delete();

// Query operations
const count = await User.count({ filter: { active: true } });
const results = await User.aggregate(pipeline);
```

Browse the detailed API documentation in each section for complete method signatures, parameters, and examples.