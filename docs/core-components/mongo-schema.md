# MongoSchema

The `MongoSchema` class provides data validation and structure definition using the `validno` library.

## Constructor

```javascript
const schema = new MongoSchema(definition, options?);
```

### Parameters

- `definition` (object): Schema field definitions
- `options` (optional object): Schema configuration options

## Basic Schema Definition

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

## Field Types

### Supported Types

| Type | Description | Example |
|------|-------------|---------|
| `String` | Text data | `'Hello World'` |
| `Number` | Numeric data | `42`, `3.14` |
| `Boolean` | True/false values | `true`, `false` |
| `Date` | Date and time | `new Date()` |
| `Array` | Lists of data | `[1, 2, 3]` |
| `Object` | Nested objects | `{ key: 'value' }` |

### Field Options

```javascript
const schema = new MongoSchema({
    // Required field
    name: { type: String, required: true },
    
    // Optional field
    description: { type: String, required: false },
    
    // Field with default value
    createdAt: { type: Date, required: false, default: () => new Date() },
    
    // Array field
    tags: { type: Array, required: false },
    
    // Nested object
    profile: {
        type: Object,
        required: false,
        properties: {
            bio: { type: String },
            website: { type: String }
        }
    }
});
```

## Schema Options

Configure schema behavior with options:

```javascript
const schema = new MongoSchema({
    title: { type: String, required: true },
    content: { type: String },
    published: { type: Boolean }
}, {
    strict: true,           // Enforce strict validation
    allowUnknown: false,    // Reject unknown fields
    stripUnknown: true      // Remove unknown fields
});
```

### Available Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `strict` | boolean | `false` | Enable strict validation mode |
| `allowUnknown` | boolean | `true` | Allow fields not in schema |
| `stripUnknown` | boolean | `false` | Remove unknown fields from data |

## Methods

### `validate(data, fields?)`

Validates data against the schema.

```javascript
const userData = {
    name: 'John Doe',
    email: 'john@example.com',
    age: 25
};

// Validate all fields
const result = schema.validate(userData);
console.log('Valid:', result.ok); // Boolean
if (!result.ok) {
    console.log('Errors:', result.errors); // Array of error details
}

// Validate specific fields only
const nameResult = schema.validate(userData, 'name');
const fieldsResult = schema.validate(userData, ['name', 'email']);
```

**Parameters:**
- `data` (object): Data to validate
- `fields` (optional string|array): Specific fields to validate

**Returns:** Object with validation results containing:
- `ok` (boolean) - Whether validation passed
- `errors` (array) - Array of validation error details if validation fails
- Other validation result properties



## Complex Schema Examples

### Nested Objects

```javascript
const postSchema = new MongoSchema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
        type: Object,
        required: true,
        properties: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            profile: {
                type: Object,
                properties: {
                    bio: { type: String },
                    avatar: { type: String }
                }
            }
        }
    },
    tags: { type: Array, required: false },
    publishedAt: { type: Date, required: false }
});
```

### Array Validation

```javascript
const productSchema = new MongoSchema({
    name: { type: String, required: true },
    categories: {
        type: Array,
        required: true,
        items: { type: String }  // All array items must be strings
    },
    reviews: {
        type: Array,
        items: {
            type: Object,
            properties: {
                rating: { type: Number, required: true },
                comment: { type: String },
                reviewer: { type: String, required: true }
            }
        }
    }
});
```

### Conditional Validation

```javascript
const userSchema = new MongoSchema({
    type: { type: String, required: true }, // 'admin' or 'user'
    name: { type: String, required: true },
    email: { type: String, required: true },
    
    // Admin-specific fields
    permissions: {
        type: Array,
        required: function(data) {
            return data.type === 'admin';
        }
    },
    
    // User-specific fields
    subscription: {
        type: String,
        required: function(data) {
            return data.type === 'user';
        }
    }
});
```

## Advanced Validation

### Custom Validators

```javascript
const schema = new MongoSchema({
    email: {
        type: String,
        required: true,
        validator: function(value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        },
        message: 'Must be a valid email address'
    },
    
    age: {
        type: Number,
        required: true,
        validator: function(value) {
            return value >= 0 && value <= 120;
        },
        message: 'Age must be between 0 and 120'
    }
});
```

### Min/Max Validation

```javascript
const schema = new MongoSchema({
    username: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20
    },
    
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    
    tags: {
        type: Array,
        minItems: 1,
        maxItems: 5
    }
});
```

## Schema Inheritance

Create base schemas and extend them:

```javascript
// Base schema
const baseSchema = new MongoSchema({
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    active: { type: Boolean, required: true, default: true }
});

// Extended schema
const userSchema = new MongoSchema({
    ...baseSchema.definition,
    name: { type: String, required: true },
    email: { type: String, required: true }
});

const productSchema = new MongoSchema({
    ...baseSchema.definition,
    name: { type: String, required: true },
    price: { type: Number, required: true }
});
```

## Integration with validno

MongoSchema is built on top of the `validno` library. For more advanced validation features, you can access the underlying validno schema:

```javascript
const schema = new MongoSchema({
    email: { type: String, required: true }
});

// Access underlying validno schema for advanced features
const validnoSchema = schema._schema;

// Use validno-specific features
const result = validnoSchema.validate(data);
if (result.error) {
    console.log('Validation error:', result.error);
}
```

For complete validation capabilities, see the [validno package documentation](https://www.npmjs.com/package/validno).

## Best Practices

### Organize Schema Definitions

```javascript
// schemas/user.js
export const userSchema = new MongoSchema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    createdAt: { type: Date, required: true, default: () => new Date() }
});

// schemas/post.js  
export const postSchema = new MongoSchema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    authorId: { type: String, required: true }
});
```

### Use Defaults for Common Fields

```javascript
const baseFields = {
    createdAt: { type: Date, required: true, default: () => new Date() },
    updatedAt: { type: Date, required: true, default: () => new Date() },
    active: { type: Boolean, required: true, default: true }
};

const userSchema = new MongoSchema({
    ...baseFields,
    name: { type: String, required: true },
    email: { type: String, required: true }
});
```



## Related

- [MongoModel](/core-components/mongo-model) - Uses schemas for data validation
- [Schema Validation](/api-reference/schema-validation) - Detailed validation API
- [Error Handling](/error-handling) - Validation error management