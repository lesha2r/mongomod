# Model Methods

Instance methods are available on individual model objects and provide functionality for data manipulation, validation, and persistence.

## Data Management Methods

### `init(data)`

Initializes the model instance with data and validates it against the schema.

```javascript
const user = new User().init({
    name: 'John Doe',
    email: 'john@example.com',
    age: 25
});
```

**Parameters:**
- `data` (object) - Initial data for the model

**Returns:** Model instance (for chaining)

**Throws:** `MmValidationError` if validation fails

**Example:**
```javascript
try {
    const user = new User().init({
        name: 'John Doe',
        email: 'john@example.com'
    });
    console.log('User initialized successfully');
} catch (error) {
    if (error instanceof MmValidationError) {
        console.log('Validation errors:', error.errors);
    }
}
```

### `set(data)`

Updates model data with new values. Does not persist to database until `save()` is called.

```javascript
user.set({ age: 26 });
user.set({ 
    age: 27, 
    updatedAt: new Date() 
});
```

**Parameters:**
- `data` (object) - Data to update

**Returns:** Model instance (for chaining)

**Example:**
```javascript
const user = new User().init({
    name: 'John',
    email: 'john@example.com',
    age: 25
});

// Update single field
user.set({ age: 26 });

// Update multiple fields
user.set({
    age: 27,
    lastLoginAt: new Date(),
    active: true
});

// Method chaining
user.set({ age: 28 }).set({ status: 'premium' });
```

### `data()`

Returns the current model data as a plain JavaScript object.

```javascript
const userData = user.data();
console.log(userData); 
// { name: 'John Doe', email: 'john@example.com', age: 25, _id: '...' }
```

**Returns:** Object containing all model data

**Example:**
```javascript
const user = new User().init({
    name: 'Alice',
    email: 'alice@example.com'
});

const data = user.data();
console.log('Name:', data.name);     // 'Alice'
console.log('Email:', data.email);   // 'alice@example.com'

// Data is a copy - modifying it won't affect the model
data.name = 'Bob';
console.log(user.data().name);       // Still 'Alice'
```

### `dataFiltered(fields)`

Returns filtered model data containing only the specified fields.

```javascript
const publicData = user.dataFiltered(['name', 'email']);
console.log(publicData); 
// { name: 'John Doe', email: 'john@example.com' }
```

**Parameters:**
- `fields` (array) - Array of field names to include

**Returns:** Object containing filtered data

**Example:**
```javascript
const user = new User().init({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'secret123',
    ssn: '123-45-6789',
    age: 30
});

// Get only public fields
const publicProfile = user.dataFiltered(['name', 'email', 'age']);
console.log(publicProfile);
// { name: 'John Doe', email: 'john@example.com', age: 30 }

// Get only contact info
const contactInfo = user.dataFiltered(['email']);
console.log(contactInfo);
// { email: 'john@example.com' }
```

## Database Operations

### `save()`

Saves the model to the database. If the model has an `_id`, it updates the existing document. If no `_id` exists, it inserts a new document.

```javascript
await user.save();
```

**Returns:** Promise resolving to the operation result

**Example:**
```javascript
// Save new user
const user = new User().init({
    name: 'Jane Doe',
    email: 'jane@example.com'
});

await user.save(true); // Insert new document
console.log('User saved with ID:', user.data()._id);

// Update existing user
user.set({ age: 25 });
await user.save(); // Update existing document

console.log('User updated');
```

### `get(filter)`

Fetches data from the database using the filter criteria and populates the model.

```javascript
const user = new User();
await user.get({ email: 'john@example.com' });
console.log(user.data()); // Populated with database data
```

**Parameters:**
- `filter` (object) - MongoDB filter criteria

**Returns:** Promise resolving to the model instance

**Throws:** `MmOperationError` if document not found

**Example:**
```javascript
// Find user by email
const user = new User();
try {
    await user.get({ email: 'john@example.com' });
    console.log('Found user:', user.data().name);
} catch (error) {
    if (error instanceof MmOperationError) {
        console.log('User not found');
    }
}

// Find user by ID
const userById = new User();
await userById.get({ _id: userId });

// Find with complex filter
const activeUser = new User();
await activeUser.get({ 
    email: 'user@example.com',
    active: true 
});
```

### `delete()`

Deletes the model's document from the database.

```javascript
await user.delete();
```

**Returns:** Promise resolving to the deletion result

**Example:**
```javascript
// Delete specific user
const user = new User();
await user.get({ email: 'user@example.com' });
await user.delete();
console.log('User deleted');

// Delete with confirmation
const userToDelete = new User();
await userToDelete.get({ _id: userId });

if (confirm('Are you sure you want to delete this user?')) {
    await userToDelete.delete();
    console.log('User deleted successfully');
}
```

## Validation Methods

### `validate()`

Validates the current model data against the schema.

```javascript
const result = user.validate();
if (!result.ok) {
    console.log('Validation failed:', result.errors);
}
```

**Returns:** Object with validation results containing:
- `ok` (boolean): Whether the data is valid
- `errors` (array): Array of validation error details if validation fails
- Other validation result properties

**Example:**
```javascript
const user = new User().init({
    name: 'John Doe',
    email: 'invalid-email', // Invalid email format
    age: -5 // Invalid age
});

const result = user.validate();
if (result.ok) {
    await user.save();
} else {
    console.log('Cannot save: validation failed');
    console.log('Errors:', result.errors);
}
```



## Utility Methods

### `toString()`

Returns a JSON string representation of the model data.

```javascript
const jsonString = user.toString();
console.log(jsonString); 
// '{"name":"John Doe","email":"john@example.com","age":25}'
```

**Returns:** JSON string of model data

**Example:**
```javascript
const user = new User().init({
    name: 'Alice Smith',
    email: 'alice@example.com',
    age: 30,
    active: true
});

// Convert to JSON string
const json = user.toString();
console.log('User as JSON:', json);

// Parse back to object
const parsed = JSON.parse(json);
console.log('Parsed name:', parsed.name);

// Pretty print
const prettyJson = JSON.stringify(user.data(), null, 2);
console.log('Pretty JSON:\n', prettyJson);
```

## Custom Methods

You can add custom methods when creating a model. These methods have access to the model instance through `this`.

```javascript
const User = mongomod.createModel({
    db: connection,
    collection: 'users',
    schema: userSchema,
    customs: {
        // Custom instance method
        getFullInfo() {
            const data = this.data();
            return `${data.name} (${data.email})`;
        },
        
        // Async custom method
        async activate() {
            this.set({ 
                active: true, 
                activatedAt: new Date() 
            });
            return await this.save();
        },
        
        // Method with parameters
        isOlderThan(age) {
            return this.data().age > age;
        },
        
        // Method that modifies data
        incrementAge() {
            const currentAge = this.data().age || 0;
            this.set({ age: currentAge + 1 });
            return this;
        }
    }
});

// Usage
const user = new User().init({
    name: 'John Doe',
    email: 'john@example.com',
    age: 25
});

console.log(user.getFullInfo()); // "John Doe (john@example.com)"
console.log(user.isOlderThan(21)); // true

await user.activate(); // Sets active: true and saves
user.incrementAge(); // Increases age by 1
await user.save(); // Persist the change
```

## Method Chaining

Many methods return the model instance, allowing for method chaining:

```javascript
const user = new User()
    .init({ name: 'John', email: 'john@example.com' })
    .set({ age: 25 })
    .set({ active: true });

await user.save();

// With custom methods that return this
user.incrementAge().set({ lastLoginAt: new Date() });
await user.save();
```

## Error Handling

Model methods can throw specific errors:

```javascript
try {
    const user = new User().init({ /* invalid data */ });
    await user.save();
} catch (error) {
    if (error instanceof MmValidationError) {
        console.log('Validation failed:', error.errors);
    } else if (error instanceof MmOperationError) {
        console.log('Database operation failed:', error.message);
    } else {
        console.log('Unexpected error:', error);
    }
}
```

For complete error handling patterns, see the [Error Handling](/advanced/error-handling) guide.