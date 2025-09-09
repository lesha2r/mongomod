# Event System

MongoMod's event system enables reactive programming patterns by allowing you to subscribe to model lifecycle events. This comprehensive guide covers all event system capabilities.

## Event Types

The MongoMod event system automatically triggers events during model operations:

| Event | Triggered When | Event Data |
|-------|----------------|------------|
| `created` | Document is inserted | `(newData, oldData)` |
| `updated` | Document is modified | `(newData, oldData)` |
| `deleted` | Document is removed | `(deletedData)` |

## Basic Usage

### Subscribing to Events

```javascript
// Subscribe to creation events
User.subscribe('created', (newData, oldData) => {
    console.log('New user created:', newData.name);
    console.log('Old data:', oldData); // null for new documents
});

// Subscribe to update events
User.subscribe('updated', (newData, oldData) => {
    console.log('User updated:', newData.name);
    console.log('Changes:', {
        old: oldData,
        new: newData
    });
});

// Subscribe to deletion events
User.subscribe('deleted', (deletedData) => {
    console.log('User deleted:', deletedData.name);
});
```

### Multiple Subscribers

You can have multiple event handlers for the same event:

```javascript
// Analytics subscriber
User.subscribe('created', (newData) => {
    analytics.track('user_signup', {
        userId: newData._id,
        email: newData.email,
        source: 'web'
    });
});

// Email subscriber
User.subscribe('created', (newData) => {
    emailService.sendWelcomeEmail(newData.email, newData.name);
});

// Audit log subscriber
User.subscribe('created', (newData) => {
    auditLog.record('USER_CREATED', {
        userId: newData._id,
        timestamp: new Date(),
        details: newData
    });
});
```

## Event Handler Patterns

### Synchronous Handlers

```javascript
User.subscribe('updated', (newData, oldData) => {
    // Synchronous processing
    console.log(`User ${newData.name} updated`);
    
    // Update cache
    cache.set(`user:${newData._id}`, newData);
    
    // Track changes
    const changes = getChanges(oldData, newData);
    if (changes.length > 0) {
        console.log('Fields changed:', changes);
    }
});

function getChanges(oldData, newData) {
    const changes = [];
    for (const key in newData) {
        if (newData[key] !== oldData[key]) {
            changes.push({
                field: key,
                oldValue: oldData[key],
                newValue: newData[key]
            });
        }
    }
    return changes;
}
```

### Asynchronous Handlers

```javascript
User.subscribe('created', async (newData) => {
    try {
        // Async operations
        await Promise.all([
            emailService.sendWelcomeEmail(newData.email),
            userService.setupDefaultPreferences(newData._id),
            analyticsService.trackSignup(newData)
        ]);
        
        console.log('Welcome flow completed for:', newData.email);
    } catch (error) {
        console.error('Welcome flow failed:', error);
        
        // Handle errors gracefully - don't throw to prevent breaking the main operation
        await errorService.logError('welcome_flow_failed', {
            userId: newData._id,
            error: error.message
        });
    }
});
```

### Conditional Event Handling

```javascript
User.subscribe('updated', (newData, oldData) => {
    // Handle email changes
    if (newData.email !== oldData.email) {
        console.log('Email changed:', {
            from: oldData.email,
            to: newData.email
        });
        
        // Send verification email
        emailService.sendEmailVerification(newData.email);
        
        // Invalidate sessions
        sessionService.invalidateUserSessions(newData._id);
    }
    
    // Handle status changes
    if (newData.status !== oldData.status) {
        console.log('Status changed:', {
            user: newData.name,
            from: oldData.status,
            to: newData.status
        });
        
        // Handle specific status transitions
        if (newData.status === 'active' && oldData.status === 'pending') {
            notificationService.send(newData._id, 'Account activated!');
        }
        
        if (newData.status === 'suspended') {
            sessionService.terminateAllSessions(newData._id);
        }
    }
    
    // Handle role changes
    if (newData.role !== oldData.role) {
        permissionService.refreshUserPermissions(newData._id);
        
        if (newData.role === 'admin') {
            auditLog.record('ADMIN_PROMOTED', {
                userId: newData._id,
                promotedBy: getCurrentUser().id
            });
        }
    }
});
```

## Advanced Event Patterns

### Cross-Model Event Handling

```javascript
// When a user is created, initialize related data
User.subscribe('created', async (userData) => {
    try {
        // Create user profile
        const Profile = mongomod.get('Profile');
        const profile = new Profile().init({
            userId: userData._id,
            displayName: userData.name,
            bio: '',
            avatar: null,
            preferences: {
                theme: 'light',
                notifications: true,
                privacy: 'public'
            }
        });
        await profile.save(true);
        
        // Create user settings
        const Settings = mongomod.get('Settings');
        const settings = new Settings().init({
            userId: userData._id,
            emailNotifications: true,
            pushNotifications: true,
            theme: 'auto',
            language: 'en'
        });
        await settings.save(true);
        
        // Create initial dashboard
        const Dashboard = mongomod.get('Dashboard');
        const dashboard = new Dashboard().init({
            userId: userData._id,
            widgets: ['welcome', 'quick-start'],
            layout: 'default'
        });
        await dashboard.save(true);
        
        console.log('User initialization completed for:', userData.email);
    } catch (error) {
        console.error('User initialization failed:', error);
        
        // Cleanup partial data if needed
        await cleanupPartialUserData(userData._id);
    }
});

// When a user is deleted, cleanup all related data
User.subscribe('deleted', async (userData) => {
    const userId = userData._id;
    
    try {
        // Get all related models
        const Profile = mongomod.get('Profile');
        const Settings = mongomod.get('Settings');
        const Post = mongomod.get('Post');
        const Comment = mongomod.get('Comment');
        const Dashboard = mongomod.get('Dashboard');
        
        // Delete related records
        await Promise.all([
            Profile.deleteMany({ filter: { userId } }),
            Settings.deleteMany({ filter: { userId } }),
            Dashboard.deleteMany({ filter: { userId } }),
            
            // Handle posts - either delete or reassign to anonymous
            Post.updateMany({
                filter: { authorId: userId },
                update: { $set: { authorId: null, authorName: 'Deleted User' } }
            }),
            
            // Delete user's comments
            Comment.deleteMany({ filter: { userId } })
        ]);
        
        console.log('User cleanup completed for:', userData.email);
        
        // Log for audit
        auditLog.record('USER_DATA_CLEANED', {
            deletedUserId: userId,
            deletedUserEmail: userData.email,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('User cleanup failed:', error);
        
        // Log for manual cleanup
        manualCleanupQueue.add('user_cleanup', {
            userId,
            userEmail: userData.email,
            error: error.message
        });
    }
});
```

### Event Chaining

```javascript
// Create a chain of events across different models
User.subscribe('created', async (userData) => {
    // Create first post for new user
    const Post = mongomod.get('Post');
    const welcomePost = new Post().init({
        title: 'Welcome to our community!',
        content: `Hi ${userData.name}! Welcome to our platform. This is your first post. Feel free to share your thoughts and connect with others!`,
        authorId: userData._id,
        published: true,
        tags: ['welcome', 'introduction']
    });
    await welcomePost.save(true); // This will trigger Post 'created' event
});

Post.subscribe('created', async (postData) => {
    // Update user's post count
    const User = mongomod.get('User');
    await User.updateOne({
        filter: { _id: postData.authorId },
        update: { $inc: { postCount: 1 } }
    });
    
    // Check for achievements
    const user = await User.findOne({ filter: { _id: postData.authorId } });
    if (user && user.postCount === 1) {
        // First post achievement
        achievementService.unlock(user._id, 'first_post');
        
        // Send congratulations
        notificationService.send(user._id, {
            type: 'achievement',
            title: 'First Post!',
            message: 'Congratulations on your first post! Keep sharing!'
        });
    }
    
    // Notify followers (if user has followers)
    const followers = await getFollowers(postData.authorId);
    if (followers.length > 0) {
        notificationService.sendToMultiple(
            followers.map(f => f._id),
            {
                type: 'new_post',
                title: 'New Post',
                message: `${user.name} published a new post: ${postData.title}`,
                postId: postData._id
            }
        );
    }
});
```

### Event-Driven Workflows

```javascript
// Order processing workflow
const Order = mongomod.get('Order');

Order.subscribe('created', async (orderData) => {
    console.log(`Order ${orderData._id} created, starting processing...`);
    
    // Start order processing workflow
    await orderProcessor.processOrder(orderData._id);
});

Order.subscribe('updated', async (newData, oldData) => {
    const statusChanged = newData.status !== oldData.status;
    
    if (statusChanged) {
        console.log(`Order ${newData._id} status: ${oldData.status} → ${newData.status}`);
        
        switch (newData.status) {
            case 'confirmed':
                await handleOrderConfirmed(newData);
                break;
                
            case 'shipped':
                await handleOrderShipped(newData);
                break;
                
            case 'delivered':
                await handleOrderDelivered(newData);
                break;
                
            case 'cancelled':
                await handleOrderCancelled(newData, oldData);
                break;
        }
    }
});

async function handleOrderConfirmed(orderData) {
    // Reserve inventory
    await inventoryService.reserveItems(orderData.items);
    
    // Charge payment
    await paymentService.charge(orderData.paymentMethod, orderData.total);
    
    // Send confirmation email
    await emailService.sendOrderConfirmation(orderData.customerEmail, orderData);
    
    // Schedule shipment
    await shippingService.schedulePickup(orderData._id);
}

async function handleOrderShipped(orderData) {
    // Send tracking information
    await emailService.sendShippingNotification(
        orderData.customerEmail,
        orderData.trackingNumber
    );
    
    // SMS notification if opted in
    if (orderData.smsNotifications) {
        await smsService.sendTrackingInfo(
            orderData.customerPhone,
            orderData.trackingNumber
        );
    }
    
    // Update estimated delivery
    const estimatedDelivery = await shippingService.getEstimatedDelivery(
        orderData.trackingNumber
    );
    
    await Order.updateOne({
        filter: { _id: orderData._id },
        update: { $set: { estimatedDelivery } }
    });
}
```

### Custom Events

You can trigger custom events from within your model methods:

```javascript
const User = mongomod.createModel({
    db: connection,
    collection: 'users',
    schema: userSchema,
    customs: {
        async promoteToAdmin() {
            const oldData = { ...this.data() };
            
            this.set({
                role: 'admin',
                promotedAt: new Date(),
                updatedAt: new Date()
            });
            
            const result = await this.save();
            
            // Trigger custom event
            this._subscriber.emit('promoted', this.data(), oldData);
            
            return result;
        },
        
        async completeProfile() {
            this.set({
                profileComplete: true,
                profileCompletedAt: new Date()
            });
            
            const result = await this.save();
            
            // Trigger custom event
            this._subscriber.emit('profile_completed', this.data());
            
            return result;
        }
    }
});

// Subscribe to custom events
User.subscribe('promoted', (newData, oldData) => {
    console.log(`User ${newData.name} promoted from ${oldData.role} to ${newData.role}`);
    
    // Grant admin permissions
    permissionService.grantAdminPermissions(newData._id);
    
    // Send promotion email
    emailService.sendPromotionNotification(newData.email, newData.role);
    
    // Audit log
    auditLog.record('USER_PROMOTED', {
        userId: newData._id,
        oldRole: oldData.role,
        newRole: newData.role,
        timestamp: new Date()
    });
});

User.subscribe('profile_completed', (userData) => {
    console.log(`User ${userData.name} completed their profile`);
    
    // Unlock features
    featureService.unlockFeatures(userData._id, ['advanced_search', 'messaging']);
    
    // Send congratulations
    notificationService.send(userData._id, {
        type: 'milestone',
        title: 'Profile Complete!',
        message: 'Great job! You\'ve unlocked new features.'
    });
    
    // Track completion rate
    analytics.track('profile_completed', {
        userId: userData._id,
        timeToComplete: userData.profileCompletedAt - userData.createdAt
    });
});
```

## Error Handling in Event Handlers

### Graceful Error Handling

```javascript
User.subscribe('created', async (newData) => {
    try {
        await emailService.sendWelcomeEmail(newData.email);
    } catch (error) {
        console.error('Failed to send welcome email:', error);
        
        // Don't throw - handle gracefully
        // Maybe add to retry queue
        emailRetryQueue.add('welcome_email', {
            userId: newData._id,
            email: newData.email,
            attempt: 1
        });
    }
});
```

### Robust Error Handling Pattern

```javascript
function createResilientHandler(handler, context = '') {
    return async (...args) => {
        try {
            await handler(...args);
        } catch (error) {
            console.error(`Event handler error ${context}:`, error);
            
            // Log error for monitoring
            await errorService.logEventError(context, error, args);
            
            // Optional: Add to dead letter queue for manual processing
            if (error.critical) {
                await deadLetterQueue.add('failed_event', {
                    context,
                    error: error.message,
                    args,
                    timestamp: new Date()
                });
            }
            
            // Don't rethrow - prevent breaking main operations
        }
    };
}

// Use resilient handlers
User.subscribe('created', createResilientHandler(
    async (userData) => {
        await emailService.sendWelcomeEmail(userData.email);
        await analyticsService.trackSignup(userData);
        await userService.initializeDefaults(userData._id);
    },
    'user-creation-handler'
));
```

## Performance Considerations

### Async Processing

```javascript
// For high-volume operations, use background processing
User.subscribe('created', (userData) => {
    // Queue for background processing instead of immediate processing
    backgroundJobQueue.add('process-new-user', userData, {
        delay: 1000, // 1 second delay
        attempts: 3,
        backoff: 'exponential'
    });
});

// Background job processor
backgroundJobQueue.process('process-new-user', async (job) => {
    const userData = job.data;
    
    await Promise.all([
        emailService.sendWelcomeEmail(userData.email),
        analyticsService.trackSignup(userData),
        userService.setupDefaults(userData._id),
        cacheService.preloadUserData(userData._id)
    ]);
});
```

### Event Batching

```javascript
// Batch similar events for efficiency
const updateBatch = new Map();

User.subscribe('updated', (newData, oldData) => {
    // Batch updates for processing
    updateBatch.set(newData._id, { newData, oldData });
    
    // Process batch every 5 seconds
    if (!updateBatch.processingScheduled) {
        updateBatch.processingScheduled = true;
        
        setTimeout(() => {
            processBatchUpdates(Array.from(updateBatch.values()));
            updateBatch.clear();
            updateBatch.processingScheduled = false;
        }, 5000);
    }
});

async function processBatchUpdates(updates) {
    // Process multiple updates efficiently
    const emailUpdates = updates.filter(u => u.newData.email !== u.oldData.email);
    const statusUpdates = updates.filter(u => u.newData.status !== u.oldData.status);
    
    if (emailUpdates.length > 0) {
        await emailService.processBatchEmailChanges(emailUpdates);
    }
    
    if (statusUpdates.length > 0) {
        await statusService.processBatchStatusChanges(statusUpdates);
    }
}
```

## Testing Events

### Event Testing Utilities

```javascript
// test/eventHelpers.js
export class EventTestHelper {
    constructor() {
        this.eventLog = [];
        this.subscribers = new Map();
    }
    
    // Mock event subscriber for testing
    mockSubscribe(model, eventName, handler) {
        const key = `${model.name}:${eventName}`;
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, []);
        }
        this.subscribers.get(key).push(handler);
        
        // Spy on original subscribe method
        const originalSubscribe = model.subscribe;
        model.subscribe = (event, callback) => {
            if (event === eventName) {
                this.eventLog.push({ model: model.name, event, callback });
                return callback;
            }
            return originalSubscribe.call(model, event, callback);
        };
    }
    
    // Trigger mock events for testing
    async triggerEvent(modelName, eventName, ...args) {
        const key = `${modelName}:${eventName}`;
        const handlers = this.subscribers.get(key) || [];
        
        for (const handler of handlers) {
            await handler(...args);
        }
    }
    
    // Get event log for assertions
    getEventLog() {
        return this.eventLog;
    }
    
    clear() {
        this.eventLog = [];
        this.subscribers.clear();
    }
}

// Usage in tests
describe('User Events', () => {
    let eventHelper;
    
    beforeEach(() => {
        eventHelper = new EventTestHelper();
    });
    
    afterEach(() => {
        eventHelper.clear();
    });
    
    test('should send welcome email on user creation', async () => {
        const emailSent = jest.fn();
        
        eventHelper.mockSubscribe(User, 'created', (userData) => {
            emailSent(userData.email);
        });
        
        await eventHelper.triggerEvent('User', 'created', {
            _id: 'user123',
            name: 'Test User',
            email: 'test@example.com'
        });
        
        expect(emailSent).toHaveBeenCalledWith('test@example.com');
    });
});
```

The event system provides powerful capabilities for building reactive, event-driven applications with MongoMod. Use these patterns to create maintainable, scalable applications that respond intelligently to data changes.