# Schema Validation

MongoSchema provides comprehensive data validation capabilities using the `validno` library. This guide covers all validation features and patterns.

## Basic Schema Definition

### Field Types

```javascript
const schema = new MongoSchema({
    // String type
    name: { type: String, required: true },
    
    // Number type
    age: { type: Number, required: false },
    
    // Boolean type
    active: { type: Boolean, required: true, default: true },
    
    // Date type
    createdAt: { type: Date, required: true, default: () => new Date() },
    
    // Array type
    tags: { type: Array, required: false },
    
    // Object type
    profile: { type: Object, required: false }
});
```

### Field Options

| Option | Type | Description | Example |
|--------|------|-------------|---------|
| `type` | Function | Field data type | `String`, `Number`, `Boolean`, `Date`, `Array`, `Object` |
| `required` | Boolean | Whether field is required | `true`, `false` |
| `default` | Any/Function | Default value or function returning default | `'defaultValue'`, `() => new Date()` |
| `validator` | Function | Custom validation function | `(value) => value > 0` |
| `message` | String | Custom error message | `'Must be a valid email'` |

## Validation Methods

### `validate(data, fields?)`

Validates data against the schema.

```javascript
const schema = new MongoSchema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number, required: false }
});

// Validate all fields
const isValid = schema.validate({
    name: 'John Doe',
    email: 'john@example.com',
    age: 25
});

console.log('Valid:', isValid); // true

// Validate specific fields
const isNameValid = schema.validate({ name: 'John' }, 'name');
const areFieldsValid = schema.validate(data, ['name', 'email']);
```

**Parameters:**
- `data` (object) - Data to validate
- `fields` (optional string|array) - Specific fields to validate

**Returns:** Boolean indicating if validation passed

### `getValidationErrors(data, fields?)`

Returns detailed validation errors.

```javascript
const errors = schema.getValidationErrors({
    name: '',
    email: 'invalid-email',
    age: -5
});

console.log(errors);
// {
//   name: 'Field is required',
//   email: 'Must be a valid email address',
//   age: 'Must be a positive number'
// }
```

## Advanced Validation

### Custom Validators

```javascript
const userSchema = new MongoSchema({
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
    },
    
    username: {
        type: String,
        required: true,
        validator: function(value) {
            // Username must be 3-20 characters, alphanumeric + underscore
            return /^[a-zA-Z0-9_]{3,20}$/.test(value);
        },
        message: 'Username must be 3-20 characters (letters, numbers, underscore only)'
    }
});
```

### Conditional Validation

```javascript
const orderSchema = new MongoSchema({
    type: { type: String, required: true }, // 'pickup' or 'delivery'
    items: { type: Array, required: true },
    
    // Required only for delivery orders
    deliveryAddress: {
        type: Object,
        required: function(data) {
            return data.type === 'delivery';
        },
        properties: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            zipCode: { type: String, required: true }
        }
    },
    
    // Required only for pickup orders
    pickupTime: {
        type: Date,
        required: function(data) {
            return data.type === 'pickup';
        },
        validator: function(value, data) {
            if (data.type === 'pickup') {
                // Must be in the future
                return value > new Date();
            }
            return true;
        },
        message: 'Pickup time must be in the future'
    }
});
```

### Array Validation

```javascript
const productSchema = new MongoSchema({
    name: { type: String, required: true },
    
    // Simple array
    tags: {
        type: Array,
        required: false,
        minItems: 1,
        maxItems: 5
    },
    
    // Array with item validation
    categories: {
        type: Array,
        required: true,
        items: { type: String },
        validator: function(value) {
            const validCategories = ['electronics', 'clothing', 'books', 'home'];
            return value.every(cat => validCategories.includes(cat.toLowerCase()));
        },
        message: 'All categories must be valid'
    },
    
    // Array of objects
    reviews: {
        type: Array,
        items: {
            type: Object,
            properties: {
                rating: { 
                    type: Number, 
                    required: true,
                    min: 1,
                    max: 5
                },
                comment: { type: String },
                reviewer: { type: String, required: true },
                date: { type: Date, required: true }
            }
        }
    }
});
```

### Nested Object Validation

```javascript
const userSchema = new MongoSchema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    
    profile: {
        type: Object,
        required: false,
        properties: {
            bio: { 
                type: String,
                maxLength: 500
            },
            avatar: { type: String },
            
            preferences: {
                type: Object,
                properties: {
                    theme: { 
                        type: String,
                        enum: ['light', 'dark', 'auto']
                    },
                    notifications: { type: Boolean },
                    language: { 
                        type: String,
                        default: 'en'
                    }
                }
            },
            
            social: {
                type: Object,
                properties: {
                    twitter: {
                        type: String,
                        validator: function(value) {
                            return !value || /^@[a-zA-Z0-9_]+$/.test(value);
                        },
                        message: 'Twitter handle must start with @'
                    },
                    github: {
                        type: String,
                        validator: function(value) {
                            return !value || /^[a-zA-Z0-9_-]+$/.test(value);
                        },
                        message: 'Invalid GitHub username'
                    }
                }
            }
        }
    }
});
```

## Validation Constraints

### String Validation

```javascript
const schema = new MongoSchema({
    username: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20,
        pattern: /^[a-zA-Z0-9_]+$/,
        message: 'Username must be 3-20 alphanumeric characters'
    },
    
    password: {
        type: String,
        required: true,
        minLength: 8,
        validator: function(value) {
            // Must contain uppercase, lowercase, number, and special char
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value);
        },
        message: 'Password must contain uppercase, lowercase, number, and special character'
    },
    
    website: {
        type: String,
        required: false,
        validator: function(value) {
            if (!value) return true; // Optional field
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        },
        message: 'Must be a valid URL'
    }
});
```

### Number Validation

```javascript
const schema = new MongoSchema({
    age: {
        type: Number,
        required: true,
        min: 0,
        max: 120,
        integer: true
    },
    
    price: {
        type: Number,
        required: true,
        min: 0,
        precision: 2 // Two decimal places
    },
    
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validator: function(value) {
            // Allow half-star ratings
            return value % 0.5 === 0;
        },
        message: 'Rating must be in 0.5 increments'
    }
});
```

### Date Validation

```javascript
const schema = new MongoSchema({
    birthDate: {
        type: Date,
        required: true,
        validator: function(value) {
            const now = new Date();
            const hundredYearsAgo = new Date(now.getFullYear() - 100, now.getMonth(), now.getDate());
            return value >= hundredYearsAgo && value <= now;
        },
        message: 'Birth date must be within the last 100 years and not in the future'
    },
    
    eventDate: {
        type: Date,
        required: true,
        validator: function(value) {
            // Event must be scheduled at least 1 hour in the future
            const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
            return value >= oneHourFromNow;
        },
        message: 'Event must be scheduled at least 1 hour in advance'
    }
});
```

## Schema Composition

### Base Schema Pattern

```javascript
// Base schema for common fields
const baseSchema = {
    createdAt: { type: Date, required: true, default: () => new Date() },
    updatedAt: { type: Date, required: true, default: () => new Date() },
    active: { type: Boolean, required: true, default: true },
    version: { type: Number, required: true, default: 1 }
};

// User schema extending base
const userSchema = new MongoSchema({
    ...baseSchema,
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true, default: 'user' }
});

// Product schema extending base
const productSchema = new MongoSchema({
    ...baseSchema,
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true }
});
```

### Schema Mixins

```javascript
// Timestampable mixin
const timestampable = {
    createdAt: { type: Date, required: true, default: () => new Date() },
    updatedAt: { type: Date, required: true, default: () => new Date() }
};

// Soft deletable mixin
const softDeletable = {
    deletedAt: { type: Date, required: false },
    active: { type: Boolean, required: true, default: true }
};

// Trackable mixin
const trackable = {
    createdBy: { type: String, required: false },
    updatedBy: { type: String, required: false }
};

// Combine mixins
const postSchema = new MongoSchema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    published: { type: Boolean, required: true, default: false },
    
    // Include mixins
    ...timestampable,
    ...softDeletable,
    ...trackable
});
```

## Validation Examples

### E-commerce Schema

```javascript
const productSchema = new MongoSchema({
    name: { 
        type: String, 
        required: true,
        minLength: 1,
        maxLength: 200
    },
    
    description: {
        type: String,
        maxLength: 2000
    },
    
    price: {
        type: Number,
        required: true,
        min: 0,
        validator: function(value) {
            // Price must have at most 2 decimal places
            return Number.isInteger(value * 100);
        },
        message: 'Price must have at most 2 decimal places'
    },
    
    category: {
        type: String,
        required: true,
        enum: ['electronics', 'clothing', 'books', 'home', 'sports']
    },
    
    inventory: {
        type: Number,
        required: true,
        min: 0,
        integer: true
    },
    
    specifications: {
        type: Object,
        properties: {
            weight: { type: Number, min: 0 },
            dimensions: {
                type: Object,
                properties: {
                    length: { type: Number, min: 0 },
                    width: { type: Number, min: 0 },
                    height: { type: Number, min: 0 }
                }
            },
            color: { type: String },
            material: { type: String }
        }
    },
    
    images: {
        type: Array,
        maxItems: 10,
        items: {
            type: String,
            validator: function(value) {
                // Simple URL validation
                return /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(value);
            },
            message: 'Must be a valid image URL'
        }
    },
    
    tags: {
        type: Array,
        maxItems: 20,
        items: {
            type: String,
            minLength: 1,
            maxLength: 50
        }
    }
});
```

### User Profile Schema

```javascript
const userProfileSchema = new MongoSchema({
    userId: { type: String, required: true },
    
    personalInfo: {
        type: Object,
        required: true,
        properties: {
            firstName: { type: String, required: true, maxLength: 50 },
            lastName: { type: String, required: true, maxLength: 50 },
            dateOfBirth: {
                type: Date,
                validator: function(value) {
                    const age = Math.floor((Date.now() - value) / (365.25 * 24 * 60 * 60 * 1000));
                    return age >= 13 && age <= 120;
                },
                message: 'Age must be between 13 and 120'
            },
            gender: {
                type: String,
                enum: ['male', 'female', 'other', 'prefer-not-to-say']
            }
        }
    },
    
    contactInfo: {
        type: Object,
        properties: {
            email: {
                type: String,
                required: true,
                validator: function(value) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                },
                message: 'Must be a valid email address'
            },
            phone: {
                type: String,
                validator: function(value) {
                    return !value || /^\+?[\d\s-()]{10,}$/.test(value);
                },
                message: 'Must be a valid phone number'
            }
        }
    },
    
    preferences: {
        type: Object,
        properties: {
            newsletter: { type: Boolean, default: false },
            notifications: { type: Boolean, default: true },
            theme: { 
                type: String, 
                enum: ['light', 'dark', 'auto'],
                default: 'auto'
            },
            language: { 
                type: String,
                default: 'en',
                validator: function(value) {
                    // ISO 639-1 language codes
                    const languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja'];
                    return languages.includes(value);
                }
            }
        }
    }
});
```

## Error Handling

### Validation Error Messages

```javascript
const schema = new MongoSchema({
    email: {
        type: String,
        required: true,
        validator: function(value) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: 'Please enter a valid email address'
    }
});

// Handle validation errors
try {
    const user = new User().init({ email: 'invalid-email' });
} catch (error) {
    if (error instanceof MmValidationError) {
        console.log('Validation failed:');
        Object.entries(error.errors).forEach(([field, message]) => {
            console.log(`  ${field}: ${message}`);
        });
    }
}
```

### Custom Error Messages

```javascript
const schema = new MongoSchema({
    password: {
        type: String,
        required: true,
        minLength: 8,
        validator: [
            {
                validator: function(value) {
                    return /[A-Z]/.test(value);
                },
                message: 'Password must contain at least one uppercase letter'
            },
            {
                validator: function(value) {
                    return /[a-z]/.test(value);
                },
                message: 'Password must contain at least one lowercase letter'
            },
            {
                validator: function(value) {
                    return /\d/.test(value);
                },
                message: 'Password must contain at least one number'
            }
        ]
    }
});
```

## Best Practices

### 1. Use Descriptive Error Messages

```javascript
// Good
age: {
    type: Number,
    required: true,
    min: 0,
    max: 120,
    message: 'Age must be between 0 and 120 years'
}

// Avoid generic messages
age: { type: Number, required: true }
```

### 2. Validate at Multiple Levels

```javascript
// Client-side validation (fast feedback)
// Schema validation (data integrity)
// Business logic validation (domain rules)

const userSchema = new MongoSchema({
    email: {
        type: String,
        required: true,
        validator: [
            {
                validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
                message: 'Invalid email format'
            },
            {
                validator: async (value) => {
                    // Check if email already exists (business rule)
                    const existing = await User.findOne({ filter: { email: value } });
                    return !existing;
                },
                message: 'Email address is already registered'
            }
        ]
    }
});
```

### 3. Use Enums for Limited Values

```javascript
const userSchema = new MongoSchema({
    role: {
        type: String,
        required: true,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
    
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive', 'pending', 'suspended'],
        default: 'pending'
    }
});
```

For more advanced validation patterns and integration with the `validno` library, see the [validno documentation](https://www.npmjs.com/package/validno).