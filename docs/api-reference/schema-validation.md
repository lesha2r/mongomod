# Schema Validation

<!--@include: ../includes/validno-info.md-->

## Basic Methods

### `validate(data, fields?)`

Validates data against the schema definition.

```javascript
const schema = new MongoSchema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number, required: false }
});

// Validate all fields
const result = schema.validate({
    name: 'Jesse Pinkman',
    email: 'jesse@lospollos.com',
    age: 25
});

console.log('Valid:', result.ok); // Boolean
if (!result.ok) {
    console.log('Errors:', result.errors); // Array of error details
}

// Validate specific fields
const nameResult = schema.validate({ name: 'John' }, 'name');
const fieldsResult = schema.validate(data, ['name', 'email']);
```

**Parameters:**
- `data` (object) - Data to validate
- `fields` (optional string|array) - Specific fields to validate

**Returns:** Object with validation results containing:
- `ok` (boolean) - Whether validation passed
- `errors` (array) - Array of validation error details if validation fails
- Other validation result properties from validno

## Schema Definition

### Basic Field Types

```javascript
const schema = new MongoSchema({
    name: { type: String, required: true },
    age: { type: Number, required: false },
    active: { type: Boolean, required: true, default: true },
    createdAt: { type: Date, required: true, default: () => new Date() },
    tags: { type: Array, required: false },
    profile: { type: Object, required: false }
});
```

### Field Options

| Option | Type | Description |
|--------|------|-------------|
| `type` | Function | Field data type (`String`, `Number`, `Boolean`, `Date`, `Array`, `Object`) |
| `required` | Boolean | Whether field is required |
| `default` | Any/Function | Default value or function returning default |

### Custom Validators

```javascript
const schema = new MongoSchema({
    email: {
        type: String,
        required: true,
        validator: function(value) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: 'Must be a valid email address'
    }
});
```

## Advanced Features

For comprehensive validation features including:
- Complex nested object validation
- Array validation with item schemas
- Conditional validation logic
- Custom validation rules
- Performance optimization
- And much more

Please refer to the [`validno` package documentation](https://www.npmjs.com/package/validno).