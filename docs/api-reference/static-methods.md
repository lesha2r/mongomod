# Static Methods

Static methods are available on model classes and provide functionality for querying, inserting, updating, and deleting documents without needing a model instance.

## Find Operations

### `Model.findOne(options)`

Finds a single document matching the filter criteria.

```javascript
const user = await User.findOne({
    filter: { email: 'john@example.com' }
});
```

**Options:**
- `filter` (object) - MongoDB filter criteria
- `projection` (optional object) - Fields to include/exclude
- `sort` (optional object) - Sort order

**Returns:** Promise resolving to document object or null

**Example:**
```javascript
// Basic find
const user = await User.findOne({
    filter: { email: 'john@example.com' }
});

if (user) {
    console.log('Found user:', user.name);
} else {
    console.log('User not found');
}

// With projection
const userProfile = await User.findOne({
    filter: { _id: userId },
    projection: { name: 1, email: 1, _id: 0 }
});

// With sorting (gets the newest user with that email)
const latestUser = await User.findOne({
    filter: { email: 'admin@example.com' },
    sort: { createdAt: -1 }
});
```

### `Model.findMany(options)`

Finds multiple documents matching the filter criteria.

```javascript
const activeUsers = await User.findMany({
    filter: { active: true },
    sort: { name: 1 },
    limit: 10
});
```

**Options:**
- `filter` (object) - MongoDB filter criteria
- `sort` (optional object) - Sort order
- `limit` (optional number) - Maximum documents to return
- `skip` (optional number) - Number of documents to skip
- `projection` (optional object) - Fields to include/exclude

**Returns:** Promise resolving to array of documents

**Example:**
```javascript
// Find all active users
const activeUsers = await User.findMany({
    filter: { active: true }
});

// Pagination
const page1 = await User.findMany({
    filter: { role: 'user' },
    sort: { createdAt: -1 },
    limit: 20,
    skip: 0
});

const page2 = await User.findMany({
    filter: { role: 'user' },
    sort: { createdAt: -1 },
    limit: 20,
    skip: 20
});

// Complex filtering
const premiumUsers = await User.findMany({
    filter: {
        $and: [
            { active: true },
            { subscription: 'premium' },
            { createdAt: { $gte: new Date('2023-01-01') } }
        ]
    },
    projection: { password: 0 }, // Exclude sensitive data
    sort: { lastLoginAt: -1 }
});
```

## Insert Operations

### `Model.insertOne(data)`

Inserts a single document into the collection.

```javascript
const result = await User.insertOne({
    name: 'Alice',
    email: 'alice@example.com',
    age: 28
});

console.log('Inserted ID:', result.insertedId);
```

**Parameters:**
- `data` (object) - Document to insert

**Returns:** Promise resolving to insertion result with `insertedId`

**Example:**
```javascript
// Simple insertion
const result = await User.insertOne({
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'user',
    createdAt: new Date()
});

console.log('New user ID:', result.insertedId);

// With validation (if schema is defined)
try {
    const validatedResult = await User.insertOne({
        name: 'Carol Johnson',
        email: 'carol@example.com',
        age: 30
    });
    console.log('User created successfully');
} catch (error) {
    console.log('Failed to create user:', error.message);
}
```

### `Model.insertMany(options)`

Inserts multiple documents into the collection.

```javascript
const result = await User.insertMany({
    data: [
        { name: 'Alice', email: 'alice@example.com' },
        { name: 'Bob', email: 'bob@example.com' }
    ]
});

console.log('Inserted IDs:', result.insertedIds);
```

**Options:**
- `data` (array) - Array of documents to insert

**Returns:** Promise resolving to insertion result with `insertedIds` array

**Example:**
```javascript
// Bulk user creation
const users = [
    { name: 'Alice Brown', email: 'alice@example.com', role: 'user' },
    { name: 'Charlie Davis', email: 'charlie@example.com', role: 'admin' },
    { name: 'Diana Wilson', email: 'diana@example.com', role: 'user' }
];

const result = await User.insertMany({ data: users });
console.log(`Created ${result.insertedIds.length} users`);

// Process results
result.insertedIds.forEach((id, index) => {
    console.log(`${users[index].name} created with ID: ${id}`);
});
```

## Update Operations

### `Model.updateOne(options)`

Updates a single document matching the filter.

```javascript
const result = await User.updateOne({
    filter: { email: 'john@example.com' },
    update: { $set: { age: 26, updatedAt: new Date() } }
});

console.log('Modified count:', result.modifiedCount);
```

**Options:**
- `filter` (object) - MongoDB filter criteria
- `update` (object) - MongoDB update operations

**Returns:** Promise resolving to update result with `modifiedCount`, `matchedCount`, etc.

**Example:**
```javascript
// Simple field update
await User.updateOne({
    filter: { _id: userId },
    update: { $set: { lastLoginAt: new Date() } }
});

// Complex update with multiple operations
await User.updateOne({
    filter: { email: 'user@example.com' },
    update: {
        $set: { 
            name: 'Updated Name',
            updatedAt: new Date()
        },
        $inc: { loginCount: 1 },
        $addToSet: { tags: 'active-user' }
    }
});

// Conditional update
const result = await User.updateOne({
    filter: { 
        email: 'user@example.com',
        active: true 
    },
    update: { $set: { status: 'premium' } }
});

if (result.matchedCount === 0) {
    console.log('No matching active user found');
}
```

### `Model.updateMany(options)`

Updates multiple documents matching the filter.

```javascript
const result = await User.updateMany({
    filter: { active: false },
    update: { $set: { status: 'inactive', updatedAt: new Date() } }
});

console.log('Modified count:', result.modifiedCount);
```

**Options:**
- `filter` (object) - MongoDB filter criteria
- `update` (object) - MongoDB update operations

**Returns:** Promise resolving to update result

**Example:**
```javascript
// Update all inactive users
const result = await User.updateMany({
    filter: { lastLoginAt: { $lt: new Date('2023-01-01') } },
    update: { 
        $set: { 
            active: false,
            deactivatedAt: new Date()
        }
    }
});

console.log(`Deactivated ${result.modifiedCount} users`);

// Bulk status update
await User.updateMany({
    filter: { role: 'beta-tester' },
    update: { 
        $set: { role: 'user' },
        $unset: { betaFeatures: "" }
    }
});
```

## Delete Operations

### `Model.deleteOne(options)`

Deletes a single document matching the filter.

```javascript
const result = await User.deleteOne({
    filter: { email: 'user@example.com' }
});

console.log('Deleted count:', result.deletedCount);
```

**Options:**
- `filter` (object) - MongoDB filter criteria

**Returns:** Promise resolving to deletion result with `deletedCount`

**Example:**
```javascript
// Delete specific user
const result = await User.deleteOne({
    filter: { email: 'user@example.com' }
});

if (result.deletedCount > 0) {
    console.log('User deleted successfully');
} else {
    console.log('No user found to delete');
}

// Delete by ID
await User.deleteOne({
    filter: { _id: userId }
});
```

### `Model.deleteMany(options)`

Deletes multiple documents matching the filter.

```javascript
const result = await User.deleteMany({
    filter: { active: false }
});

console.log('Deleted count:', result.deletedCount);
```

**Options:**
- `filter` (object) - MongoDB filter criteria

**Returns:** Promise resolving to deletion result with `deletedCount`

**Example:**
```javascript
// Delete inactive users
const result = await User.deleteMany({
    filter: { 
        active: false,
        lastLoginAt: { $lt: new Date('2022-01-01') }
    }
});

console.log(`Deleted ${result.deletedCount} inactive users`);

// Delete test users
await User.deleteMany({
    filter: { email: { $regex: 'test.*@example.com' } }
});
```

## Aggregation and Utility Methods

### `Model.count(options)`

Counts documents matching the filter.

```javascript
const activeCount = await User.count({
    filter: { active: true }
});

console.log('Active users:', activeCount);
```

**Options:**
- `filter` (object) - MongoDB filter criteria

**Returns:** Promise resolving to document count

**Example:**
```javascript
// Count all users
const totalUsers = await User.count({ filter: {} });

// Count by criteria
const premiumUsers = await User.count({
    filter: { subscription: 'premium' }
});

const recentUsers = await User.count({
    filter: { 
        createdAt: { $gte: new Date('2023-01-01') }
    }
});

console.log(`Total: ${totalUsers}, Premium: ${premiumUsers}, Recent: ${recentUsers}`);
```

### `Model.distinct(options)`

Gets distinct values for a specified field.

```javascript
const uniqueAges = await User.distinct({
    field: 'age',
    filter: { active: true }
});

console.log('Unique ages:', uniqueAges);
```

**Options:**
- `field` (string) - Field name to get distinct values for
- `filter` (optional object) - MongoDB filter criteria

**Returns:** Promise resolving to array of distinct values

**Example:**
```javascript
// Get all unique roles
const roles = await User.distinct({
    field: 'role'
});

// Get unique departments for active users
const departments = await User.distinct({
    field: 'department',
    filter: { active: true }
});

// Get unique subscription types
const subscriptions = await User.distinct({
    field: 'subscription.type'
});

console.log('Available roles:', roles);
console.log('Active departments:', departments);
console.log('Subscription types:', subscriptions);
```

### `Model.aggregate(pipeline)`

Performs aggregation operations using MongoDB's aggregation framework.

```javascript
const stats = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
]);
```

**Parameters:**
- `pipeline` (array) - MongoDB aggregation pipeline

**Returns:** Promise resolving to aggregation results

**Example:**
```javascript
// User statistics by role
const roleStats = await User.aggregate([
    { $match: { active: true } },
    { $group: { 
        _id: '$role', 
        count: { $sum: 1 },
        avgAge: { $avg: '$age' }
    }},
    { $sort: { count: -1 } }
]);

// Monthly user registration trends
const monthlyStats = await User.aggregate([
    {
        $group: {
            _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
        }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
]);

// Complex aggregation with lookup
const usersWithPosts = await User.aggregate([
    { $match: { active: true } },
    {
        $lookup: {
            from: 'posts',
            localField: '_id',
            foreignField: 'authorId',
            as: 'posts'
        }
    },
    {
        $addFields: {
            postCount: { $size: '$posts' }
        }
    },
    { $match: { postCount: { $gt: 0 } } },
    { $sort: { postCount: -1 } },
    { $limit: 10 }
]);
```

## Bulk Operations

### `Model.bulkWrite(options)`

Performs multiple write operations in a single request for better performance.

```javascript
const result = await User.bulkWrite({
    operations: [
        {
            insertOne: {
                document: { name: 'Dave', email: 'dave@example.com' }
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
```

**Options:**
- `operations` (array) - Array of operation objects

**Returns:** Promise resolving to bulk operation result

**Example:**
```javascript
// Mixed bulk operations
const operations = [
    // Insert new users
    {
        insertOne: {
            document: { 
                name: 'New User 1', 
                email: 'user1@example.com',
                createdAt: new Date()
            }
        }
    },
    {
        insertOne: {
            document: { 
                name: 'New User 2', 
                email: 'user2@example.com',
                createdAt: new Date()
            }
        }
    },
    
    // Update existing users
    {
        updateMany: {
            filter: { role: 'beta' },
            update: { $set: { role: 'user' } }
        }
    },
    
    // Delete inactive users
    {
        deleteMany: {
            filter: { 
                active: false,
                lastLoginAt: { $lt: new Date('2022-01-01') }
            }
        }
    }
];

const result = await User.bulkWrite({ operations });
console.log('Bulk operation result:', result);
```

## Query Examples

### Complex Filtering

```javascript
// Advanced queries with multiple conditions
const results = await User.findMany({
    filter: {
        $and: [
            { active: true },
            { age: { $gte: 18, $lte: 65 } },
            {
                $or: [
                    { role: 'admin' },
                    { role: 'moderator' }
                ]
            },
            { createdAt: { $gte: new Date('2023-01-01') } }
        ]
    },
    sort: { lastLoginAt: -1 },
    limit: 50
});

// Text search (requires text index)
const searchResults = await User.findMany({
    filter: { $text: { $search: 'john developer' } },
    projection: { score: { $meta: 'textScore' } },
    sort: { score: { $meta: 'textScore' } }
});

// Regex search
const emailMatches = await User.findMany({
    filter: { 
        email: { $regex: '@company\\.com$', $options: 'i' }
    }
});

// Array field queries
const taggedUsers = await User.findMany({
    filter: {
        tags: { $in: ['premium', 'verified'] }
    }
});
```



## Error Handling

Static methods can throw various errors:

```javascript
try {
    const user = await User.findOne({
        filter: { email: 'user@example.com' }
    });
} catch (error) {
    if (error instanceof MmControllerError) {
        console.log('Database query failed:', error.message);
    } else {
        console.log('Unexpected error:', error);
    }
}

// Handle bulk operation errors
try {
    await User.bulkWrite({ operations });
} catch (error) {
    console.log('Bulk operation failed:', error.message);
    // Handle partial failures if needed
}
```

Static methods provide powerful querying and manipulation capabilities while maintaining the simplicity and consistency of the MongoMod API.