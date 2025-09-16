<!-- ✅ checked @ 16.09.2025 -->
# MongoSubscriber

The `MongoSubscriber` class provides an event system that allows you to subscribe to model lifecycle events such as create, update, and delete operations.

## Overview

MongoSubscriber enables reactive programming patterns by allowing you to listen to model events and execute custom logic when certain operations occur. This is particularly useful for:

- Logging and auditing
- Cache invalidation
- Sending notifications
- Triggering side effects
- Data synchronization

## Event Types

The following events are automatically triggered during model operations:

| Event | Triggered When | Parameters |
|-------|----------------|------------|
| `created` | Document is inserted | `(newData, oldData)` |
| `updated` | Document is modified | `(newData, oldData)` |
| `deleted` | Document is removed | `(deletedData)` |

## Basic Usage

### Subscribing to Events

```javascript
// Create model with event system
const User = mongomod.createModel({
    db: connection,
    collection: 'users',
    schema: userSchema
});

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

### Event Triggering

Events are automatically triggered during model operations:

```javascript{6,10,13}
// This will trigger 'created' event
const user = new User().init({
    name: 'John Doe',
    email: 'john@example.com'
});
await user.insert(); // Triggers 'created' event

// This will trigger 'updated' event
user.set({ age: 25 });
await user.save(); // Triggers 'updated' event

// This will trigger 'deleted' event
await user.delete(); // Triggers 'deleted' event
```

## Subscriber Methods

### `subscribe(eventName, callback)`

Subscribes to a specific event.

```javascript
User.subscribe('created', (newData, oldData) => {
    // Any side effects
});

User.subscribe('updated', (newData, oldData) => {
    // Any side effects
});

User.subscribe('deleted', (deletedData) => {
    // Any side effects
});
```

**Parameters:**
- `eventName` (string): Name of the event ('created', 'updated', 'deleted')
- `callback` (function): Function to execute when event is triggered

### Multiple Subscribers

You can have multiple subscribers for the same model and event:

```javascript
// Analytics subscriber
User.subscribe('created', (newData) => {
    analytics.track('user_created', newData._id);
});

// Email subscriber
User.subscribe('created', (newData) => {
    emailService.sendWelcomeEmail(newData.email, newData.name);
});

// Audit log subscriber
User.subscribe('created', (newData) => {
    auditLog.log('USER_CREATED', { userId: newData._id });
});
```

## Event Data

### Created Event

```javascript
User.subscribe('created', (newData, oldData) => {
    console.log('New data:', newData);     // Newly created document
    console.log('Old data:', oldData);     // null (no previous data)
});

// When triggered by:
const user = new User().init({ name: 'John', email: 'john@example.com' });
await user.save(true);
```

### Updated Event

```javascript
User.subscribe('updated', (newData, oldData) => {
    console.log('New data:', newData);     // Document after update
    console.log('Old data:', oldData);     // Document before update
    
    // Compare changes
    const changes = {};
    for (const key in newData) {
        if (newData[key] !== oldData[key]) {
            changes[key] = { old: oldData[key], new: newData[key] };
        }
    }
    console.log('Changes:', changes);
});

// When triggered by:
user.set({ age: 25, updatedAt: new Date() });
await user.save();
```

### Deleted Event

```javascript
User.subscribe('deleted', (deletedData) => {
    console.log('Deleted data:', deletedData); // The deleted document
});

// When triggered by:
await user.delete();
```

## Advanced examples

### Conditional Event Handling

```javascript
User.subscribe('updated', (newData, oldData) => {
    // Only handle email changes
    if (newData.email !== oldData.email) {
        console.log('Email changed:', {
            from: oldData.email,
            to: newData.email
        });
        
        // Send email verification for new email
        emailService.sendVerification(newData.email);
    }
    
    // Only handle status changes
    if (newData.status !== oldData.status) {
        console.log('Status changed:', {
            from: oldData.status,
            to: newData.status
        });
        
        // Handle status-specific logic
        if (newData.status === 'active') {
            notificationService.send('Account activated');
        }
    }
});
```

### Async Event Handling

```javascript
User.subscribe('created', async (newData) => {
    try {
        // Async operations
        await emailService.sendWelcomeEmail(newData.email);
        await analytics.track('user_signup', newData);
        await userOnboarding.initialize(newData._id);
        
        console.log('Welcome flow completed for:', newData.email);
    } catch (error) {
        console.error('Welcome flow failed:', error);
        // Handle errors appropriately
    }
});
```

## Related

- [MongoModel](/core-components/mongo-model) - Model operations that trigger events
- [Event System API](/api-reference/event-system) - Detailed event system API
- [Advanced Usage](/advanced-usage) - Complex event patterns and model inheritance