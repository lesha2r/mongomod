# Quick Start

This guide will help you get started with MongoMod in just a few minutes.

## Step 1: Basic Setup

First, import MongoMod and create a database connection:

```javascript
import mongomod from 'mongomod';

// Create connection
const db = new mongomod.Connection({
    link: 'your-mongo-host:27017',
    login: 'username',        // optional
    password: 'password',     // optional
    dbName: 'your-database',
    srv: false               // Set to true for MongoDB Atlas
});

// Connect to database
await db.connect();
```

### Connection Options

| Option | Type | Description | Required |
|--------|------|-------------|----------|
| `link` | string | MongoDB host and port | ✅ |
| `dbName` | string | Database name | ✅ |
| `login` | string | Username for authentication | ❌ |
| `password` | string | Password for authentication | ❌ |
| `srv` | boolean | Use SRV record (for MongoDB Atlas) | ❌ |

## Step 2: Define a Schema

Create a schema to define the structure and validation rules for your data:

```javascript
import { MongoSchema } from 'mongomod';

const userSchema = new MongoSchema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number, required: false },
    createdAt: { type: Date, required: false },
    active: { type: Boolean, required: false }
});
```

### Schema Types

MongoMod supports the following schema types:

- `String` - Text data
- `Number` - Numeric data
- `Boolean` - True/false values
- `Date` - Date and time
- `Array` - Lists of data
- `Object` - Nested objects

### Schema Options

- `required: true` - Field must be provided
- `type: Type` - Data type validation
- Custom validation rules (see [Schema Validation](/api-reference/schema-validation))

## Step 3: Create a Model

Define custom methods and create your model:

```javascript
// Define custom methods
const customMethods = {
    getFullInfo() {
        return `${this.data().name} (${this.data().email})`;
    },
    
    isAdult() {
        return this.data().age >= 18;
    },
    
    activate() {
        this.set({ active: true, updatedAt: new Date() });
        return this.save();
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

## Step 4: Use the Model

### Creating and Saving Documents

```javascript
// Create and save a new user
const user = new User().init({
    name: 'John Doe',
    email: 'john@example.com',
    age: 25,
    createdAt: new Date(),
    active: true
});

// Save to database
await user.save(true); // true = insert if not exists

// Use custom methods
console.log(user.getFullInfo()); // "John Doe (john@example.com)"
console.log(user.isAdult()); // true

// Activate user
await user.activate();
```

### Querying Documents

```javascript
// Find single document
const foundUser = await User.findOne({
    filter: { email: 'john@example.com' }
});

// Find multiple documents
const activeUsers = await User.findMany({
    filter: { active: true },
    sort: { createdAt: -1 },
    limit: 10
});

// Count documents
const userCount = await User.count({
    filter: { active: true }
});
```

### Updating Documents

```javascript
// Update instance
user.set({ age: 26 });
await user.save();

// Static update methods
await User.updateOne({
    filter: { email: 'john@example.com' },
    update: { $set: { age: 27 } }
});

await User.updateMany({
    filter: { active: false },
    update: { $set: { status: 'inactive' } }
});
```

### Deleting Documents

```javascript
// Delete instance
await user.delete();

// Static delete methods
await User.deleteOne({
    filter: { email: 'john@example.com' }
});

await User.deleteMany({
    filter: { active: false }
});
```

## Complete Example

Here's a complete working example:

```javascript
import mongomod from 'mongomod';

async function main() {
    // 1. Setup connection
    const db = new mongomod.Connection({
        link: 'localhost:27017',
        dbName: 'myapp'
    });
    await db.connect();
    
    // 2. Define schema
    const userSchema = new mongomod.Schema({
        name: { type: String, required: true },
        email: { type: String, required: true },
        age: { type: Number }
    });
    
    // 3. Create model
    const User = mongomod.createModel({
        db: db,
        collection: 'users',
        schema: userSchema,
        customs: {
            greet() {
                return `Hello, ${this.data().name}!`;
            }
        }
    });
    
    // 4. Use the model
    const user = new User().init({
        name: 'Alice',
        email: 'alice@example.com',
        age: 30
    });
    
    await user.save(true);
    console.log(user.greet()); // "Hello, Alice!"
    
    const allUsers = await User.findMany({ filter: {} });
    console.log('Total users:', allUsers.length);
}

main().catch(console.error);
```

## Next Steps

Now that you have the basics, explore more advanced features:

- [Core Components](/core-components/mongo-model) - Deep dive into each component
- [API Reference](/api-reference/model-methods) - Complete method documentation
- [Advanced Usage](/advanced-usage) - Complex schemas and model inheritance
- [Event System](/api-reference/event-system) - Reactive programming with model events