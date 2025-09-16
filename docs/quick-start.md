# Quick Start

This guide will help you get started with MongoMod in just a few minutes.

## Step 1: Install the package

```bash
npm i mongomod
```

## Step 2: Connect to database

First, import MongoMod and create a database connection:

```javascript
import mongomod from 'mongomod';

// Create connection
const db = new mongomod.Connection({
    link: 'your-mongo-host:27017',
    login: 'username',
    password: 'password',
    dbName: 'your-database',
    srv: false               // Set to true for MongoDB Atlas
});

// Connect to database
await db.connect();

export db
```

### Connection Options

<!--@include: ./.includes/connection-options.md-->

## Step 2: Define a Schema

<!--@include: ./.includes/validno-info.md-->

Create a schema to define the structure and validation rules for your future model. Let's create a simple user model as example:

```javascript
import { MongoSchema } from 'mongomod';

const userSchema = new MongoSchema({
    name: { type: String },
    email: { type: String },
    age: { type: Number, required: false },
    active: { type: Boolean, required: false },
    createdAt: { type: Date, required: false }
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
- `CustomClass` - Custom type
- `any` - Any type

### Schema Options

- `required: boolean` - Is field required (default: true)
- `type: Type` - Data type validation
- `rules: Object` - Custom validation rules (see [Schema Validation](/api-reference/schema-validation))

## Step 3: Create a Model

Now when we have data schema, let's create a model itself:

```javascript
const User = mongomod.createModel({
    db: db,
    collection: 'users',
    schema: userSchema,
});
```

Wait! How about adding some custom model features?

::: details
Custom methods let you add your own functions to models, making it easier to organize your code and work with your data in a more natural way.
:::

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

### Create new user

```javascript
// Create and save a new user
const user = new User().init({
    name: 'Jesse Pinkman',
    email: 'jesse@lospollos.com',
    age: 25,
    active: true,
    createdAt: new Date()
});

// Save to database
await user.save();

// Use custom methods
console.log(user.getFullInfo()); // "Jesse Pinkman (jesse@lospollos.com)"
console.log(user.isAdult()); // true

// Activate user
await user.activate();
```

### Get existing user and modify it

```javascript
// Create and save a new user
const user = await new User().get({
    email: 'jesse@lospollos.com'
});

// Save to database
await user.save();

// Use custom methods
console.log(user.getFullInfo()); // "Jesse Pinkman (jesse@lospollos.com)"

user.set({ age: 26})
await user.save()
```

## Step 5: Use static methods

Each model provides access to its underlying collection, allowing you to use static methods that map to standard MongoDB operations like findMany, updateMany, aggregation and more.

Static methods let you perform collection-level operations for your business logic without requiring model instantiation.

### Querying Documents

```javascript
// Find single document
const foundUser = await User.findOne({
    filter: { email: 'jesse@lospollos.com' }
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

### Inserting Documents

```javascript
// Insert one document
await User.insertOne({
    name: 'Jesse Pinkman',
    email: 'jesse@lospollos.com',
    age: 25,
    active: true,
    createdAt: new Date()
});

// Insert array of documents
await User.insertMany({
    data: [
        {
            name: 'Jesse Pinkman',
            email: 'jesse@lospollos.com',
            age: 25,
            active: true,
            createdAt: new Date()
        },
        // ... other docs
    ]
});
```

### Updating Documents

```javascript
// Updates first found document
await User.updateOne({
    filter: { email: 'jesse@lospollos.com' },
    update: { $set: { age: 27 } }
});

// Update all matching documents
await User.updateMany({
    filter: { active: false },
    update: { $set: { status: 'inactive' } }
});
```

### Deleting Documents

```javascript
// Delete first matching document
await User.deleteOne({
    filter: { email: 'jesse@lospollos.com' }
});

// Delete all matching documents
await User.deleteMany({
    filter: { active: false }
});
```

### Aggregating Documents

```javascript
// Perform an aggregation according to MongoDb's documentation
await User.aggregation([
    { $match: { email: 'jesse@lospollos.com' } }
]);
```

## Step 6: Subscribe to events

The event system allows you to react to model changes automatically, eliminating the need to manually call methods. Here are some examples:

```js
// Subscribe to creation events
User.subscribe('created', (newData, oldData) => {
    console.log('New user created:', newData);
    // Send welcome email, update analytics, etc.
});

// Subscribe to update events
User.subscribe('updated', (newData, oldData) => {
    console.log('User updated:', { old: oldData, new: newData });
    // Log changes, notify other systems, etc.
});

// Subscribe to deletion events
User.subscribe('deleted', (deletedData) => {
    console.log('User deleted:', deletedData);
    // Cleanup related data, send notifications, etc.
});
```



## Next Steps

That's it! Now you know how to establish connection, create and use models in a very convinient way. Now that you have the basics, explore more advanced features:

- [Core Concepts](/core-concepts/model) - Deep dive into each component
- [API Reference](/api-reference/model-methods) - Complete method documentation
- [Advanced Usage](/advanced/advanced-usage) - Complex schemas and model inheritance
- [Event System](/api-reference/event-system) - Reactive programming with model events