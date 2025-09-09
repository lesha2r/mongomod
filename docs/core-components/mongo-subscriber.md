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

```javascript
// This will trigger 'created' event
const user = new User().init({
    name: 'John Doe',
    email: 'john@example.com'
});
await user.save(true); // Triggers 'created' event

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
    // Handle creation event
});

User.subscribe('updated', (newData, oldData) => {
    // Handle update event
});

User.subscribe('deleted', (deletedData) => {
    // Handle deletion event
});
```

**Parameters:**
- `eventName` (string): Name of the event ('created', 'updated', 'deleted')
- `callback` (function): Function to execute when event is triggered

### Multiple Subscribers

You can have multiple subscribers for the same event:

```javascript
// Analytics subscriber
User.subscribe('created', (newData) => {
    analytics.track('user_created', {
        userId: newData._id,
        email: newData.email
    });
});

// Email subscriber
User.subscribe('created', (newData) => {
    emailService.sendWelcomeEmail(newData.email, newData.name);
});

// Audit log subscriber
User.subscribe('created', (newData) => {
    auditLog.log('USER_CREATED', {
        userId: newData._id,
        timestamp: new Date(),
        data: newData
    });
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

## Advanced Usage

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

### Async Event Handlers

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

### Cross-Model Event Handling

```javascript
// When a user is created, create related records
User.subscribe('created', async (userData) => {
    // Create user profile
    const Profile = mongomod.get('Profile');
    const profile = new Profile().init({
        userId: userData._id,
        displayName: userData.name,
        createdAt: new Date()
    });
    await profile.save(true);
    
    // Create user preferences
    const Preferences = mongomod.get('Preferences');
    const preferences = new Preferences().init({
        userId: userData._id,
        theme: 'light',
        notifications: true
    });
    await preferences.save(true);
});

// When a user is deleted, cleanup related data
User.subscribe('deleted', async (userData) => {
    const userId = userData._id;
    
    // Delete related records
    const Profile = mongomod.get('Profile');
    const Post = mongomod.get('Post');
    const Comment = mongomod.get('Comment');
    
    await Profile.deleteMany({ filter: { userId } });
    await Post.deleteMany({ filter: { authorId: userId } });
    await Comment.deleteMany({ filter: { userId } });
    
    console.log('Cleaned up data for deleted user:', userData.email);
});
```

### Event Error Handling

```javascript
User.subscribe('created', async (newData) => {
    try {
        await externalService.createUser(newData);
    } catch (error) {
        console.error('External service error:', error);
        
        // Handle the error gracefully
        // Maybe add to retry queue or log for manual processing
        retryQueue.add('create_external_user', newData);
    }
});

// Global error handler for all events
User.subscribe('*', (eventName, ...args) => {
    try {
        // Log all events for debugging
        console.log(`Event ${eventName} triggered:`, args);
    } catch (error) {
        console.error('Event logging error:', error);
    }
});
```

## Event System Integration

### With Custom Model Methods

```javascript
const userCustoms = {
    async promote(newRole) {
        const oldData = { ...this.data() }; // Capture old state
        
        this.set({
            role: newRole,
            promotedAt: new Date(),
            updatedAt: new Date()
        });
        
        const result = await this.save();
        
        // Manually trigger custom event
        this._subscriber.emit('promoted', this.data(), oldData);
        
        return result;
    }
};

const User = mongomod.createModel({
    db: connection,
    collection: 'users',
    schema: userSchema,
    customs: userCustoms
});

// Subscribe to custom event
User.subscribe('promoted', (newData, oldData) => {
    console.log(`User ${newData.name} promoted from ${oldData.role} to ${newData.role}`);
    
    // Send promotion notification
    notificationService.send(`Congratulations! You've been promoted to ${newData.role}`);
});
```

### Event Chaining

```javascript
// Chain events across different models
User.subscribe('created', async (userData) => {
    // Create initial post for new user
    const Post = mongomod.get('Post');
    const welcomePost = new Post().init({
        title: 'Welcome to our platform!',
        content: 'This is your first post. Start sharing your thoughts!',
        authorId: userData._id,
        published: true
    });
    await welcomePost.save(true);
});

Post.subscribe('created', async (postData) => {
    // Update user's post count
    const User = mongomod.get('User');
    await User.updateOne({
        filter: { _id: postData.authorId },
        update: { $inc: { postCount: 1 } }
    });
    
    // If it's user's first post, send achievement notification
    const user = await User.findOne({ filter: { _id: postData.authorId } });
    if (user && user.postCount === 1) {
        achievementService.unlock(user._id, 'first_post');
    }
});
```

## Best Practices

### Organize Event Handlers

```javascript
// events/userEvents.js
export const userEventHandlers = {
    async onUserCreated(userData) {
        await emailService.sendWelcomeEmail(userData.email);
        await analytics.track('user_signup', userData);
    },
    
    async onUserUpdated(newData, oldData) {
        if (newData.email !== oldData.email) {
            await emailService.sendVerification(newData.email);
        }
    },
    
    async onUserDeleted(userData) {
        await cleanupService.removeUserData(userData._id);
    }
};

// models/User.js
import { userEventHandlers } from '../events/userEvents.js';

const User = mongomod.createModel({
    db: connection,
    collection: 'users',
    schema: userSchema
});

User.subscribe('created', userEventHandlers.onUserCreated);
User.subscribe('updated', userEventHandlers.onUserUpdated);
User.subscribe('deleted', userEventHandlers.onUserDeleted);
```

### Error Resilience

```javascript
function createResilientHandler(handler, context = '') {
    return async (...args) => {
        try {
            await handler(...args);
        } catch (error) {
            console.error(`Event handler error ${context}:`, error);
            
            // Optional: Add to retry queue or dead letter queue
            // Optional: Send error notifications to monitoring service
            
            // Don't throw - prevent event errors from breaking main operations
        }
    };
}

// Use resilient handlers
User.subscribe('created', createResilientHandler(
    userEventHandlers.onUserCreated,
    'user-created'
));
```

### Performance Considerations

```javascript
// For high-volume operations, consider async processing
User.subscribe('created', (userData) => {
    // Queue for background processing instead of doing work immediately
    jobQueue.add('process-new-user', userData, {
        delay: 1000, // 1 second delay
        attempts: 3
    });
});

// Background job processor
jobQueue.process('process-new-user', async (job) => {
    const userData = job.data;
    
    await emailService.sendWelcomeEmail(userData.email);
    await analytics.track('user_signup', userData);
    await userOnboarding.initialize(userData._id);
});
```

## Debugging Events

```javascript
// Enable debug logging for all events
User.subscribe('*', (eventName, ...args) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[DEBUG] Event: ${eventName}`, args);
    }
});

// Log event execution time
function createTimedHandler(handler, eventName) {
    return async (...args) => {
        const start = Date.now();
        await handler(...args);
        const duration = Date.now() - start;
        console.log(`Event ${eventName} completed in ${duration}ms`);
    };
}
```

## Related

- [MongoModel](/core-components/mongo-model) - Model operations that trigger events
- [Event System API](/api-reference/event-system) - Detailed event system API
- [Advanced Usage](/advanced-usage) - Complex event patterns and model inheritance