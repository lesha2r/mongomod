# MongoSchema

<!--@include: ../.includes/validno-info.md-->

## Constructor

```javascript
const schema = new MongoSchema(definition);
```

### Parameters

- `definition` (object): Schema field definitions

## Basic Schema Definition

```javascript
import { MongoSchema } from 'mongomod';

const userSchema = new MongoSchema({
    name: { type: String },
    email: { type: String },
    age: { type: Number, required: false },
    createdAt: { type: Date, required: false },
    active: { type: Boolean, required: false }
});
```

<i>Note that all fields are recognized as `required: true` by default, so you only need to set `required: false` when a field is optional.</i>


## Field Types

### Supported Types

| Type | Description | Example |
|------|-------------|---------|
| `String` | Text data | `'Hello World'` |
| `Number` | Numeric data | `42`, `3.14` |
| `Boolean` | True/false values | `true`, `false` |
| `Date` | Date and time | `new Date()` |
| `Array` | List of values | `[1, 2, 3]` |
| `Object` | Nested objects | `{ key: 'value' }` |
| `any` | any type | `any kind of data` |

### Field Options

```javascript
const schema = new MongoSchema({
    // Required field
    name: { type: String },
    
    // Optional field
    description: { type: String, required: false },
    
    // Field with default value
    createdAt: { type: Date },
    
    // Array field
    tags: { type: Array, required: false },
    
    // Nested object
    profile: {
        bio: { type: String },
        website: { type: String }
    }
});
```

## Methods

### `validate(data, fields?)`

Validates data against the schema.

```javascript
const userData = {
    name: 'Jesse Pinkman',
    email: 'jesse@lospollos.com',
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
- `errors` (string[]) - Array of validation error details if validation fails
- `passed` (string[]) - List of keys that passed validation
- `failed` (string[]) - List of keys that failed validation
- `missed` (string[]) - List of keys that are missing
- `byKeys` (Record<string, boolean>) - Validation result for each key (note that nested keys are specified as `parent.child`)
- `errorsByKeys` (Record<string, string[]>) - Array of validation error details for each key that failed validation (helper for building validation messages)
- `joinErrors()` (Function<string[]>) - Helper method for getting all errors as a string separated by `; ` or a specified separator provided as an argument

See all validation result properties: [validno docs](https://validno.kodzero.pro/validation-results)



## Complex Schema Examples

### Nested Objects

```javascript
const postSchema = new MongoSchema({
    title: { type: String },
    content: { type: String },
    author: {
        name: { type: String },
        email: { type: String },
        profile: {
            bio: { type: String },
            avatar: { type: String }
        }
    },
    tags: { type: Array, required: false },
    publishedAt: { type: Date, required: false }
});
```

### Array Validation

```javascript{4-5}
const productSchema = new MongoSchema({
    name: { type: String },
    categories: {
        type: Array,
        eachType: String // Specifies the expected type for all items in the array
    },
    reviews: {
        rating: { type: Number },
        comment: { type: String },
        reviewer: { type: String }
    }
});
```

### Custom validation callback

Custom rule functions receive value and context:

```javascript{11-19}
const schema = new MongoSchema({
    password: {
        type: String,
            rules: {
                lengthMin: 8
            }
    }
    confirmPassword: {
        type: String,
        rules: {
            custom: (value, { input }) => {
                // Access the original input data
                const password = input.password;
                
                return {
                    result: value === password,
                    details: value === password ? '' : 'Passwords do not match'
                };
            }
        }
    }
});
```

See all built-in `validno` rules: [Custom rules docs](https://validno.kodzero.pro/string-rules)

## Schema Inheritance

Create base schemas and extend them:

```javascript
// Base schema
const baseSchema = new MongoSchema({
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    active: { type: Boolean, required: true }
});

// Extended schema
const userSchema = new MongoSchema({
    ...baseSchema.schema.definition,
    name: { type: String, required: true },
    email: { type: String, required: true }
});

const productSchema = new MongoSchema({
    ...baseSchema.schema.definition,
    name: { type: String, required: true },
    price: { type: Number, required: true }
});
```

## Integration with validno

MongoSchema is built on top of the `validno` library. For more advanced validation features, you can access the underlying validno schema:

```javascript
const userSchema = new MongoSchema({
    email: { type: String, required: true }
});

// Access underlying validno schema for advanced features
const validnoSchema = userSchema.schema;

// Use validno-specific features
const result = validnoSchema.validate(data);
console.log(result)
```

For complete validation capabilities, see the [validno package documentation](https://www.npmjs.com/package/validno).

## Best Practices

### Organize Schema Definitions

```javascript
// schemas/user.js
export const userSchema = new MongoSchema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    createdAt: { type: Date, required: true }
});

// schemas/post.js  
export const postSchema = new MongoSchema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    authorId: { type: String, required: true }
});
```

## Related

- [MongoModel](/core-concepts/model) - Uses schemas for data validation
- [Schema Validation](/api-reference/schema-validation) - Detailed validation API
- [Error Handling](/advanced/error-handling) - Validation error management