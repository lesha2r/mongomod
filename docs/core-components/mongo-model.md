# MongoModel

The `MongoModel` class is the main model class that combines schema validation, custom methods, and database operations. It provides an intuitive, object-oriented interface for working with MongoDB documents.

## Creating Models

### Using `mongomod.createModel()`

The recommended way to create models is using the factory method:

```javascript
const User = mongomod.createModel({
    db: connection,        // MongoConnection instance
    collection: 'users',   // Collection name
    schema: userSchema,    // MongoSchema instance (optional)
    customs: customMethods // Custom methods object (optional)
});
```

### Constructor Parameters

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `db` | MongoConnection | Database connection | ✅ |
| `collection` | string | MongoDB collection name | ✅ |
| `schema` | MongoSchema | Schema for validation | ❌ |
| `customs` | object | Custom methods to add to model | ❌ |

## Instance Methods

### Data Management

#### `init(data)`

Initializes the model instance with data and validates it against the schema.

```javascript
const user = new User().init({
    name: 'John Doe',
    email: 'john@example.com',
    age: 25
});
```

**Parameters:**
- `data` (object): Initial data for the model

**Returns:** Model instance (for chaining)

**Throws:** `MmValidationError` if validation fails

#### `set(data)`

Updates model data with new values.

```javascript
user.set({ age: 26 });
user.set({ 
    age: 27, 
    updatedAt: new Date() 
});
```

**Parameters:**
- `data` (object): Data to update

**Returns:** Model instance (for chaining)

#### `data()`

Returns the current model data.

```javascript
const userData = user.data();
console.log(userData); // { name: 'John Doe', email: 'john@example.com', age: 25 }
```

**Returns:** Object containing model data

#### `dataFiltered(fields)`

Returns filtered model data with only specified fields.

```javascript
const publicData = user.dataFiltered(['name', 'email']);
console.log(publicData); // { name: 'John Doe', email: 'john@example.com' }
```

**Parameters:**
- `fields` (array): Array of field names to include

**Returns:** Object containing filtered data

### Database Operations

#### `save(upsert?)`

Saves the model to the database.

```javascript
// Update existing document
await user.save();

// Insert if not exists, update if exists
await user.save(true);
```

**Parameters:**
- `upsert` (optional boolean): If true, insert document if it doesn't exist

**Returns:** Promise resolving to operation result

#### `get(filter)`

Fetches data from database using filter and populates the model.

```javascript
const user = new User();
await user.get({ email: 'john@example.com' });
console.log(user.data()); // Populated with database data
```

**Parameters:**
- `filter` (object): MongoDB filter criteria

**Returns:** Promise resolving to model instance

**Throws:** `MmOperationError` if document not found

#### `delete()`

Deletes the model's document from the database.

```javascript
await user.delete();
```

**Returns:** Promise resolving to deletion result

### Validation

#### `validate()`

Validates current model data against the schema.

```javascript
const isValid = user.validate();
if (!isValid) {
    console.log('Validation failed');
}
```

**Returns:** Boolean indicating if data is valid

#### `getValidationErrors()`

Returns detailed validation errors.

```javascript
const errors = user.getValidationErrors();
console.log(errors);
// { email: 'Field is required', age: 'Must be a number' }
```

**Returns:** Object with field names as keys and error messages as values

### Utility Methods

#### `toString()`

Returns JSON string representation of model data.

```javascript
const jsonString = user.toString();
console.log(jsonString); // '{"name":"John Doe","email":"john@example.com","age":25}'
```

**Returns:** JSON string

## Static Methods (Query Methods)

All static methods are automatically available on created models and provide database querying capabilities.

### Find Operations

#### `Model.findOne(options)`

Finds a single document.

```javascript
const user = await User.findOne({
    filter: { email: 'john@example.com' }
});
```

#### `Model.findMany(options)`

Finds multiple documents.

```javascript
const activeUsers = await User.findMany({
    filter: { active: true },
    sort: { createdAt: -1 },
    limit: 10
});
```

### Insert Operations

#### `Model.insertOne(data)`

Inserts a single document.

```javascript
const result = await User.insertOne({
    name: 'Alice',
    email: 'alice@example.com'
});
```

#### `Model.insertMany(options)`

Inserts multiple documents.

```javascript
const result = await User.insertMany({
    data: [
        { name: 'Bob', email: 'bob@example.com' },
        { name: 'Carol', email: 'carol@example.com' }
    ]
});
```

### Update Operations

#### `Model.updateOne(options)`

Updates a single document.

```javascript
await User.updateOne({
    filter: { email: 'john@example.com' },
    update: { $set: { age: 26 } }
});
```

#### `Model.updateMany(options)`

Updates multiple documents.

```javascript
await User.updateMany({
    filter: { active: false },
    update: { $set: { status: 'inactive' } }
});
```

### Delete Operations

#### `Model.deleteOne(options)`

Deletes a single document.

```javascript
await User.deleteOne({
    filter: { email: 'john@example.com' }
});
```

#### `Model.deleteMany(options)`

Deletes multiple documents.

```javascript
await User.deleteMany({
    filter: { active: false }
});
```

### Aggregation and Utility

#### `Model.count(options)`

Counts documents matching filter.

```javascript
const activeCount = await User.count({
    filter: { active: true }
});
```

#### `Model.aggregate(pipeline)`

Performs aggregation operations.

```javascript
const stats = await User.aggregate([
    { $group: { _id: '$department', count: { $sum: 1 } } }
]);
```

#### `Model.distinct(options)`

Gets distinct values for a field.

```javascript
const departments = await User.distinct({
    field: 'department'
});
```

#### `Model.bulkWrite(options)`

Performs bulk operations.

```javascript
await User.bulkWrite({
    operations: [
        { insertOne: { document: { name: 'Dave' } } },
        { updateOne: { filter: { name: 'Alice' }, update: { $inc: { loginCount: 1 } } } }
    ]
});
```

## Custom Methods

Define custom methods to extend model functionality:

```javascript
const customMethods = {
    // Instance method
    getFullInfo() {
        return `${this.data().name} (${this.data().email})`;
    },
    
    // Instance method with model operations
    async activate() {
        this.set({ 
            active: true, 
            activatedAt: new Date() 
        });
        return await this.save();
    },
    
    // Instance method accessing other data
    async getPosts() {
        const Post = mongomod.get('Post'); // Get another model
        return await Post.findMany({
            filter: { authorId: this.data()._id }
        });
    },
    
    // Async instance method
    async sendWelcomeEmail() {
        // Email sending logic
        console.log(`Sending welcome email to ${this.data().email}`);
        
        // Update last email sent
        this.set({ lastEmailSent: new Date() });
        await this.save();
    }
};

const User = mongomod.createModel({
    db: connection,
    collection: 'users',
    schema: userSchema,
    customs: customMethods
});

// Usage
const user = new User().init({
    name: 'John Doe',
    email: 'john@example.com'
});

console.log(user.getFullInfo()); // "John Doe (john@example.com)"
await user.activate();
await user.sendWelcomeEmail();
```

## Complete Example

Here's a comprehensive example showing all MongoModel features:

```javascript
import mongomod from 'mongomod';

// Setup connection
const db = new mongomod.Connection({
    link: 'localhost:27017',
    dbName: 'blog'
});
await db.connect();

// Define schema
const postSchema = new mongomod.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    authorId: { type: String, required: true },
    tags: { type: Array, required: false },
    published: { type: Boolean, required: true, default: false },
    publishedAt: { type: Date, required: false },
    createdAt: { type: Date, required: true, default: () => new Date() },
    updatedAt: { type: Date, required: true, default: () => new Date() }
});

// Define custom methods
const postCustoms = {
    // Publish the post
    async publish() {
        this.set({
            published: true,
            publishedAt: new Date(),
            updatedAt: new Date()
        });
        return await this.save();
    },
    
    // Unpublish the post
    async unpublish() {
        this.set({
            published: false,
            publishedAt: null,
            updatedAt: new Date()
        });
        return await this.save();
    },
    
    // Get formatted title
    getFormattedTitle() {
        const title = this.data().title;
        return title.charAt(0).toUpperCase() + title.slice(1);
    },
    
    // Add tags
    addTags(newTags) {
        const currentTags = this.data().tags || [];
        const uniqueTags = [...new Set([...currentTags, ...newTags])];
        this.set({ 
            tags: uniqueTags,
            updatedAt: new Date()
        });
        return this;
    },
    
    // Get post summary
    getSummary(maxLength = 200) {
        const content = this.data().content;
        return content.length > maxLength 
            ? content.substring(0, maxLength) + '...'
            : content;
    }
};

// Create model
const Post = mongomod.createModel({
    db: db,
    collection: 'posts',
    schema: postSchema,
    customs: postCustoms
});

// Usage examples
async function examples() {
    // Create new post
    const post = new Post().init({
        title: 'my first post',
        content: 'This is the content of my first blog post. It contains some interesting information.',
        authorId: 'user123',
        tags: ['javascript', 'mongodb']
    });
    
    // Use custom methods
    console.log(post.getFormattedTitle()); // "My first post"
    console.log(post.getSummary(30)); // "This is the content of my fir..."
    
    // Add more tags and save
    post.addTags(['tutorial', 'beginner']);
    await post.save(true); // Insert new document
    
    // Publish the post
    await post.publish();
    
    // Find published posts
    const publishedPosts = await Post.findMany({
        filter: { published: true },
        sort: { publishedAt: -1 }
    });
    
    // Update multiple posts
    await Post.updateMany({
        filter: { authorId: 'user123' },
        update: { $addToSet: { tags: 'author-user123' } }
    });
    
    // Get post statistics
    const postCount = await Post.count({ filter: {} });
    const publishedCount = await Post.count({ filter: { published: true } });
    
    console.log(`Total posts: ${postCount}, Published: ${publishedCount}`);
    
    // Aggregate by tags
    const tagStats = await Post.aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
    
    console.log('Tag statistics:', tagStats);
}

examples().catch(console.error);
```

## Model Registration

Models are automatically registered and can be retrieved:

```javascript
// Models are automatically stored
const User = mongomod.createModel({
    db: connection,
    collection: 'users',
    schema: userSchema
});

// Retrieve model later
const UserModel = mongomod.get('User'); // Gets the User model
const models = mongomod.models; // Object containing all registered models
```

## Best Practices

### Organize Models

```javascript
// models/User.js
export const User = mongomod.createModel({
    db: connection,
    collection: 'users',
    schema: userSchema,
    customs: userCustoms
});

// models/Post.js
export const Post = mongomod.createModel({
    db: connection,
    collection: 'posts', 
    schema: postSchema,
    customs: postCustoms
});

// models/index.js
export { User } from './User.js';
export { Post } from './Post.js';
```

### Validate Before Save

```javascript
const customMethods = {
    async safeSave(upsert = false) {
        if (!this.validate()) {
            const errors = this.getValidationErrors();
            throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
        }
        return await this.save(upsert);
    }
};
```

### Use Custom Methods for Business Logic

```javascript
const userCustoms = {
    async changePassword(newPassword) {
        // Hash password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update model
        this.set({
            password: hashedPassword,
            passwordChangedAt: new Date(),
            updatedAt: new Date()
        });
        
        // Save and trigger events
        return await this.save();
    },
    
    async deactivate() {
        this.set({
            active: false,
            deactivatedAt: new Date()
        });
        
        // Trigger cleanup operations
        await this.cleanupSessions();
        return await this.save();
    }
};
```

## Related

- [MongoSchema](/core-components/mongo-schema) - Schema validation for models
- [MongoController](/core-components/mongo-controller) - Low-level database operations
- [Event System](/api-reference/event-system) - Model lifecycle events
- [Custom Methods](/advanced-usage#model-inheritance-and-extension) - Advanced custom method patterns