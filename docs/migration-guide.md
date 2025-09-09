# Migration Guide

**IMPORTANT:** Version 2.0.0 introduces breaking changes and is **NOT backward compatible** with versions prior to 2.0.0.

This guide will help you migrate from MongoMod v1.x to v2.0+.

## Overview of Changes

Version 2.0+ introduces several significant improvements but requires code changes:

- **ES Modules**: Now uses ES modules instead of CommonJS
- **Schema Validation**: Updated validation syntax using `validno` library
- **Custom Methods**: New binding system for custom methods
- **Event System**: Updated event subscriber syntax
- **TypeScript**: Full TypeScript support with better type definitions
- **Connection Management**: Improved connection handling

## Breaking Changes

### 1. Module System

**Before (v1.x):**
```javascript
const mongomod = require('mongomod');
const { MongoSchema, MongoConnection } = require('mongomod');
```

**After (v2.0+):**
```javascript
import mongomod from 'mongomod';
import { MongoSchema, MongoConnection } from 'mongomod';
```

**Required Changes:**
- Update `package.json` to include `"type": "module"`
- Change all `require()` statements to `import`
- Update file extensions to `.mjs` if needed

### 2. Schema Definition

**Before (v1.x):**
```javascript
const schema = new MongoSchema({
    name: String,
    email: String,
    age: Number,
    active: Boolean
});
```

**After (v2.0+):**
```javascript
const schema = new MongoSchema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number, required: false },
    active: { type: Boolean, required: true, default: true }
});
```

**Required Changes:**
- Use object notation for all fields
- Explicitly specify `required` property
- Use `default` property for default values

### 3. Custom Methods Binding

**Before (v1.x):**
```javascript
const customs = {
    getFullName: function() {
        return this.name + ' ' + this.surname;
    }
};
```

**After (v2.0+):**
```javascript
const customs = {
    getFullName() {
        return `${this.data().name} ${this.data().surname}`;
    }
};
```

**Required Changes:**
- Use `this.data()` to access model data instead of direct property access
- Arrow functions are supported but `this` context works differently
- Use ES6 method shorthand syntax

### 4. Connection Configuration

**Before (v1.x):**
```javascript
const connection = new MongoConnection({
    host: 'localhost',
    port: 27017,
    database: 'myapp',
    username: 'user',
    password: 'pass'
});
```

**After (v2.0+):**
```javascript
const connection = new mongomod.Connection({
    link: 'localhost:27017',
    login: 'user',
    password: 'pass',
    dbName: 'myapp',
    srv: false
});
```

**Required Changes:**
- Use `link` instead of separate `host` and `port`
- Use `dbName` instead of `database`
- Use `login` instead of `username`
- Add `srv` property for MongoDB Atlas

### 5. Event System

**Before (v1.x):**
```javascript
Model.on('created', (data) => {
    console.log('Created:', data);
});
```

**After (v2.0+):**
```javascript
Model.subscribe('created', (newData, oldData) => {
    console.log('Created:', newData);
});
```

**Required Changes:**
- Use `subscribe()` instead of `on()`
- Event handlers receive different parameters (see Event System docs)

## Step-by-Step Migration

### Step 1: Update Package.json

```json
{
  "name": "your-app",
  "type": "module",
  "dependencies": {
    "mongomod": "^2.1.0"
  }
}
```

### Step 2: Update Imports

```javascript
// Old
const mongomod = require('mongomod');

// New
import mongomod from 'mongomod';
```

### Step 3: Update Schemas

```javascript
// Old
const userSchema = new MongoSchema({
    name: String,
    email: String,
    age: Number
});

// New
const userSchema = new MongoSchema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number, required: false }
});
```

### Step 4: Update Custom Methods

```javascript
// Old
const userMethods = {
    getDisplayName: function() {
        return this.name || this.email;
    }
};

// New
const userMethods = {
    getDisplayName() {
        const data = this.data();
        return data.name || data.email;
    }
};
```

### Step 5: Update Connection

```javascript
// Old
const db = new MongoConnection({
    host: 'localhost',
    port: 27017,
    database: 'myapp'
});

// New
const db = new mongomod.Connection({
    link: 'localhost:27017',
    dbName: 'myapp'
});
```

### Step 6: Update Event Handlers

```javascript
// Old
User.on('created', (userData) => {
    sendWelcomeEmail(userData.email);
});

// New
User.subscribe('created', (newData, oldData) => {
    sendWelcomeEmail(newData.email);
});
```

## Migration Examples

### Complete Before/After Example

**Before (v1.x):**
```javascript
const mongomod = require('mongomod');
const { MongoSchema, MongoConnection } = require('mongomod');

const connection = new MongoConnection({
    host: 'localhost',
    port: 27017,
    database: 'blog'
});

const postSchema = new MongoSchema({
    title: String,
    content: String,
    published: Boolean,
    createdAt: Date
});

const postMethods = {
    publish: function() {
        this.published = true;
        this.publishedAt = new Date();
        return this.save();
    },
    
    getExcerpt: function(length) {
        return this.content.substring(0, length || 100);
    }
};

const Post = mongomod.createModel({
    connection: connection,
    collection: 'posts',
    schema: postSchema,
    methods: postMethods
});

Post.on('created', function(data) {
    console.log('New post created:', data.title);
});

module.exports = { Post };
```

**After (v2.0+):**
```javascript
import mongomod from 'mongomod';

const connection = new mongomod.Connection({
    link: 'localhost:27017',
    dbName: 'blog'
});

const postSchema = new mongomod.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    published: { type: Boolean, required: true, default: false },
    createdAt: { type: Date, required: true, default: () => new Date() }
});

const postMethods = {
    async publish() {
        this.set({
            published: true,
            publishedAt: new Date()
        });
        return await this.save();
    },
    
    getExcerpt(length = 100) {
        return this.data().content.substring(0, length);
    }
};

const Post = mongomod.createModel({
    db: connection,
    collection: 'posts',
    schema: postSchema,
    customs: postMethods
});

Post.subscribe('created', (newData, oldData) => {
    console.log('New post created:', newData.title);
});

export { Post };
```

### Complex Migration Example

**Before (v1.x):**
```javascript
const mongomod = require('mongomod');

// Multiple connections
const mainDB = new mongomod.Connection({
    host: 'localhost',
    port: 27017,
    database: 'main'
});

const analyticsDB = new mongomod.Connection({
    host: 'analytics-server',
    port: 27017,
    database: 'analytics'
});

// Complex schema
const userSchema = new mongomod.Schema({
    name: String,
    email: String,
    profile: {
        bio: String,
        avatar: String,
        social: {
            twitter: String,
            github: String
        }
    }
});

// Model with complex methods
const User = mongomod.model('User', {
    connection: mainDB,
    schema: userSchema,
    methods: {
        updateProfile: function(profileData) {
            this.profile = { ...this.profile, ...profileData };
            return this.save();
        },
        
        trackActivity: function(action) {
            const Analytics = mongomod.model('Analytics');
            return Analytics.create({
                userId: this._id,
                action: action,
                timestamp: new Date()
            });
        }
    }
});
```

**After (v2.0+):**
```javascript
import mongomod from 'mongomod';

// Multiple connections
const mainDB = new mongomod.Connection({
    link: 'localhost:27017',
    dbName: 'main'
});

const analyticsDB = new mongomod.Connection({
    link: 'analytics-server:27017',
    dbName: 'analytics'
});

// Complex schema
const userSchema = new mongomod.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    profile: {
        type: Object,
        required: false,
        properties: {
            bio: { type: String },
            avatar: { type: String },
            social: {
                type: Object,
                properties: {
                    twitter: { type: String },
                    github: { type: String }
                }
            }
        }
    }
});

// Model with complex methods
const User = mongomod.createModel({
    db: mainDB,
    collection: 'users',
    schema: userSchema,
    customs: {
        async updateProfile(profileData) {
            const currentProfile = this.data().profile || {};
            this.set({
                profile: { ...currentProfile, ...profileData }
            });
            return await this.save();
        },
        
        async trackActivity(action) {
            const Analytics = mongomod.get('Analytics');
            return await Analytics.insertOne({
                userId: this.data()._id,
                action: action,
                timestamp: new Date()
            });
        }
    }
});
```

## Common Migration Issues

### Issue 1: Direct Property Access

**Problem:**
```javascript
// This won't work in v2.0+
const name = user.name;
user.name = 'New Name';
```

**Solution:**
```javascript
// Use data() method
const name = user.data().name;
user.set({ name: 'New Name' });
```

### Issue 2: Synchronous Operations

**Problem:**
```javascript
// Some operations are now async
user.save(); // Missing await
```

**Solution:**
```javascript
// Add await for async operations
await user.save();
```

### Issue 3: Schema Validation

**Problem:**
```javascript
// Old schema format won't validate properly
const schema = new MongoSchema({
    name: String // Missing required property
});
```

**Solution:**
```javascript
// Specify validation requirements explicitly
const schema = new MongoSchema({
    name: { type: String, required: true }
});
```

### Issue 4: Connection Parameters

**Problem:**
```javascript
// Old connection format
const db = new MongoConnection({
    host: 'localhost',
    database: 'myapp'
});
```

**Solution:**
```javascript
// New connection format
const db = new mongomod.Connection({
    link: 'localhost:27017',
    dbName: 'myapp'
});
```

## Migration Tools

### Automated Schema Converter

```javascript
// migration/convertSchema.js
export function convertSchema(oldSchema) {
    const newSchema = {};
    
    for (const [field, type] of Object.entries(oldSchema)) {
        if (typeof type === 'function') {
            // Convert simple types
            newSchema[field] = {
                type: type,
                required: true // You may need to adjust this
            };
        } else if (typeof type === 'object') {
            // Handle complex types
            newSchema[field] = convertComplexType(type);
        }
    }
    
    return newSchema;
}

function convertComplexType(type) {
    // Add logic to handle nested objects, arrays, etc.
    return type;
}

// Usage
const oldSchema = {
    name: String,
    email: String,
    age: Number
};

const newSchema = convertSchema(oldSchema);
console.log(newSchema);
```

### Connection Migration Script

```javascript
// migration/updateConnections.js
export function updateConnectionConfig(oldConfig) {
    return {
        link: `${oldConfig.host}:${oldConfig.port}`,
        login: oldConfig.username,
        password: oldConfig.password,
        dbName: oldConfig.database,
        srv: oldConfig.srv || false
    };
}
```

## Testing Migration

### Create Test Suite

```javascript
// tests/migration.test.js
import mongomod from 'mongomod';

describe('Migration Tests', () => {
    test('Schema validation works with new format', () => {
        const schema = new mongomod.Schema({
            name: { type: String, required: true },
            email: { type: String, required: true }
        });
        
        expect(schema.validate({
            name: 'Test User',
            email: 'test@example.com'
        })).toBe(true);
    });
    
    test('Custom methods have access to data', async () => {
        const User = mongomod.createModel({
            db: testConnection,
            collection: 'test_users',
            schema: userSchema,
            customs: {
                getDisplayName() {
                    return this.data().name;
                }
            }
        });
        
        const user = new User().init({ name: 'Test User' });
        expect(user.getDisplayName()).toBe('Test User');
    });
});
```

## Post-Migration Checklist

- [ ] All imports updated to ES modules
- [ ] Package.json includes `"type": "module"`
- [ ] Schema definitions use object notation
- [ ] Custom methods use `this.data()` for data access
- [ ] Connection configurations updated
- [ ] Event handlers use `subscribe()` method
- [ ] All async operations use `await`
- [ ] Tests pass with new version
- [ ] Error handling updated for new error types
- [ ] TypeScript types updated (if using TypeScript)

## Getting Help

If you encounter issues during migration:

1. Check the [API Reference](/api-reference/) for updated method signatures
2. Review the [Error Handling](/error-handling) guide for new error types
3. Look at [Advanced Usage](/advanced-usage) examples for complex patterns
4. Open an issue on [GitHub](https://github.com/lesha2r/mongomod/issues) if you need help

## Gradual Migration Strategy

For large applications, consider a gradual migration approach:

1. **Phase 1**: Update module system and package.json
2. **Phase 2**: Migrate schemas one by one
3. **Phase 3**: Update custom methods
4. **Phase 4**: Update connection configurations
5. **Phase 5**: Update event handlers
6. **Phase 6**: Full testing and deployment

This approach allows you to migrate incrementally while maintaining application functionality.