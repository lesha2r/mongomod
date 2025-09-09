# MongoController

The `MongoController` class provides low-level database operations. It's usually used internally by models, but can be used directly for advanced database operations.

## Constructor

```javascript
const controller = new mongomod.Controller(db, collectionName);
```

### Parameters

- `db`: MongoConnection instance
- `collectionName`: Name of the MongoDB collection

## Basic Usage

```javascript
import mongomod from 'mongomod';

// Setup connection
const db = new mongomod.Connection({
    link: 'localhost:27017',
    dbName: 'myapp'
});
await db.connect();

// Create controller
const controller = new mongomod.Controller(db, 'users');

// Use controller methods
const result = await controller.findMany({
    filter: { active: true },
    sort: { createdAt: -1 },
    limit: 10
});
```

## Query Methods

### `findOne(options)`

Finds a single document matching the filter.

```javascript
const user = await controller.findOne({
    filter: { email: 'john@example.com' },
    projection: { name: 1, email: 1 }, // optional
    sort: { createdAt: -1 }            // optional
});
```

**Options:**
- `filter` (object): MongoDB filter criteria
- `projection` (optional object): Fields to include/exclude
- `sort` (optional object): Sort order

**Returns:** Document object or null if not found

### `findMany(options)`

Finds multiple documents matching the filter.

```javascript
const users = await controller.findMany({
    filter: { active: true },
    sort: { name: 1 },
    limit: 50,
    skip: 0,
    projection: { password: 0 } // exclude password field
});
```

**Options:**
- `filter` (object): MongoDB filter criteria
- `sort` (optional object): Sort order
- `limit` (optional number): Maximum number of documents
- `skip` (optional number): Number of documents to skip
- `projection` (optional object): Fields to include/exclude

**Returns:** Array of documents

## Insert Methods

### `insertOne(options)`

Inserts a single document.

```javascript
const result = await controller.insertOne({
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date()
});

console.log('Inserted ID:', result.insertedId);
```

**Parameters:** Document object to insert

**Returns:** Object with `insertedId` property

### `insertMany(options)`

Inserts multiple documents.

```javascript
const result = await controller.insertMany({
    data: [
        { name: 'Alice', email: 'alice@example.com' },
        { name: 'Bob', email: 'bob@example.com' }
    ]
});

console.log('Inserted IDs:', result.insertedIds);
```

**Options:**
- `data` (array): Array of documents to insert

**Returns:** Object with `insertedIds` array

## Update Methods

### `updateOne(options)`

Updates a single document.

```javascript
const result = await controller.updateOne({
    filter: { email: 'john@example.com' },
    update: { 
        $set: { 
            name: 'John Smith',
            updatedAt: new Date()
        } 
    }
});

console.log('Modified count:', result.modifiedCount);
```

**Options:**
- `filter` (object): MongoDB filter criteria
- `update` (object): MongoDB update operations

**Returns:** Object with `modifiedCount`, `matchedCount`, etc.

### `updateMany(options)`

Updates multiple documents.

```javascript
const result = await controller.updateMany({
    filter: { active: false },
    update: { 
        $set: { 
            status: 'inactive',
            updatedAt: new Date()
        } 
    }
});

console.log('Modified count:', result.modifiedCount);
```

**Options:**
- `filter` (object): MongoDB filter criteria
- `update` (object): MongoDB update operations

**Returns:** Object with `modifiedCount`, `matchedCount`, etc.

## Delete Methods

### `deleteOne(options)`

Deletes a single document.

```javascript
const result = await controller.deleteOne({
    filter: { email: 'john@example.com' }
});

console.log('Deleted count:', result.deletedCount);
```

**Options:**
- `filter` (object): MongoDB filter criteria

**Returns:** Object with `deletedCount` property

### `deleteMany(options)`

Deletes multiple documents.

```javascript
const result = await controller.deleteMany({
    filter: { active: false }
});

console.log('Deleted count:', result.deletedCount);
```

**Options:**
- `filter` (object): MongoDB filter criteria

**Returns:** Object with `deletedCount` property

## Aggregation Methods

### `aggregate(pipeline)`

Performs aggregation operations.

```javascript
const results = await controller.aggregate([
    { $match: { active: true } },
    { $group: { 
        _id: '$department',
        count: { $sum: 1 },
        avgAge: { $avg: '$age' }
    }},
    { $sort: { count: -1 } }
]);
```

**Parameters:** Aggregation pipeline array

**Returns:** Array of aggregation results

### `count(options)`

Counts documents matching the filter.

```javascript
const count = await controller.count({
    filter: { active: true }
});

console.log('Active users:', count);
```

**Options:**
- `filter` (object): MongoDB filter criteria

**Returns:** Number of matching documents

### `distinct(options)`

Gets distinct values for a field.

```javascript
const uniqueAges = await controller.distinct({
    field: 'age',
    filter: { active: true }
});

console.log('Unique ages:', uniqueAges);
```

**Options:**
- `field` (string): Field name to get distinct values for
- `filter` (optional object): MongoDB filter criteria

**Returns:** Array of distinct values

## Bulk Operations

### `bulkWrite(operations)`

Performs multiple write operations in a single request.

```javascript
const result = await controller.bulkWrite({
    operations: [
        {
            insertOne: {
                document: { name: 'Eve', email: 'eve@example.com' }
            }
        },
        {
            updateOne: {
                filter: { name: 'Alice' },
                update: { $inc: { loginCount: 1 } }
            }
        },
        {
            deleteOne: {
                filter: { status: 'deleted' }
            }
        }
    ]
});

console.log('Bulk result:', result);
```

**Options:**
- `operations` (array): Array of operation objects

**Returns:** Bulk operation result object

## Advanced Query Examples

### Complex Filtering

```javascript
// Text search with multiple conditions
const users = await controller.findMany({
    filter: {
        $and: [
            { active: true },
            { age: { $gte: 18, $lte: 65 } },
            { $or: [
                { department: 'Engineering' },
                { department: 'Design' }
            ]}
        ]
    },
    sort: { createdAt: -1 },
    limit: 20
});
```

### Projection Examples

```javascript
// Include only specific fields
const users = await controller.findMany({
    filter: { active: true },
    projection: { name: 1, email: 1, _id: 0 }
});

// Exclude specific fields
const users = await controller.findMany({
    filter: { active: true },
    projection: { password: 0, secretKey: 0 }
});
```

### Pagination

```javascript
const pageSize = 20;
const pageNumber = 2; // 0-based

const users = await controller.findMany({
    filter: { active: true },
    sort: { name: 1 },
    limit: pageSize,
    skip: pageNumber * pageSize
});
```

### Advanced Aggregation

```javascript
// Complex aggregation with lookups and grouping
const results = await controller.aggregate([
    // Match active users
    { $match: { active: true } },
    
    // Lookup posts by user
    {
        $lookup: {
            from: 'posts',
            localField: '_id',
            foreignField: 'authorId',
            as: 'posts'
        }
    },
    
    // Add calculated fields
    {
        $addFields: {
            postCount: { $size: '$posts' },
            hasPublished: { $gt: [{ $size: '$posts' }, 0] }
        }
    },
    
    // Group by department
    {
        $group: {
            _id: '$department',
            totalUsers: { $sum: 1 },
            activePublishers: { $sum: { $cond: ['$hasPublished', 1, 0] } },
            avgPostCount: { $avg: '$postCount' }
        }
    },
    
    // Sort by total users
    { $sort: { totalUsers: -1 } }
]);
```

## Error Handling

MongoController methods can throw `MmControllerError`:

```javascript
import { MmControllerError } from 'mongomod';

try {
    const result = await controller.findOne({
        filter: { invalidField: { $invalidOperator: 'value' } }
    });
} catch (error) {
    if (error instanceof MmControllerError) {
        console.error('Controller error:', error.message);
        // Handle database operation error
    }
}
```

## Direct Collection Access

For operations not covered by controller methods, access the underlying MongoDB collection:

```javascript
// Get native MongoDB collection
const collection = controller.collection;

// Use native MongoDB methods
const result = await collection.createIndex({ email: 1 }, { unique: true });

// Advanced queries
const cursor = collection.find({ active: true }).sort({ name: 1 });
await cursor.forEach(doc => {
    console.log(doc.name);
});
```

## Best Practices

### Use Controllers for Raw Operations

Controllers are ideal when you need direct database access without model validation:

```javascript
// Fast bulk operations
const controller = new mongomod.Controller(db, 'logs');
await controller.insertMany({
    data: largeBatchOfLogEntries
});
```

### Combine with Models

Use controllers within custom model methods:

```javascript
const User = mongomod.createModel({
    db: connection,
    collection: 'users',
    schema: userSchema,
    customs: {
        async getRecentActivity() {
            const controller = new mongomod.Controller(this.db, 'activities');
            return await controller.findMany({
                filter: { userId: this.data()._id },
                sort: { timestamp: -1 },
                limit: 10
            });
        }
    }
});
```

### Performance Optimization

```javascript
// Use projection to limit data transfer
const summaries = await controller.findMany({
    filter: { published: true },
    projection: { title: 1, summary: 1, publishedAt: 1 },
    sort: { publishedAt: -1 }
});

// Use indexes for better performance
const collection = controller.collection;
await collection.createIndex({ email: 1 }, { unique: true });
await collection.createIndex({ createdAt: -1 });
```

## Related

- [MongoModel](/core-components/mongo-model) - High-level model operations
- [MongoConnection](/core-components/mongo-connection) - Database connection management  
- [API Reference](/api-reference/static-methods) - Model static methods that use controllers