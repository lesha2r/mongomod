# Advanced Usage

This guide covers advanced patterns and techniques for using MongoMod effectively in complex applications.

## Complex Schema Validation

For more advanced schema validation features, MongoMod leverages the [`validno` package](https://www.npmjs.com/package/validno). Here are some advanced validation patterns:

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
        },
        items: { type: String }
    },
    
    // User-specific fields
    subscription: {
        type: String,
        required: function(data) {
            return data.type === 'user';
        },
        enum: ['basic', 'premium', 'enterprise']
    }
});
```

### Custom Validators

```javascript
const productSchema = new MongoSchema({
    name: { type: String, required: true },
    price: {
        type: Number,
        required: true,
        validator: function(value) {
            return value > 0 && value <= 10000;
        },
        message: 'Price must be between 0 and 10000'
    },
    category: {
        type: String,
        required: true,
        validator: function(value) {
            const validCategories = ['electronics', 'clothing', 'books', 'home'];
            return validCategories.includes(value.toLowerCase());
        },
        message: 'Category must be one of: electronics, clothing, books, home'
    },
    sku: {
        type: String,
        required: true,
        validator: function(value) {
            // SKU format: 3 letters + 4 numbers
            return /^[A-Z]{3}\d{4}$/.test(value);
        },
        message: 'SKU must be in format ABC1234'
    }
});
```

### Nested Validation

```javascript
const orderSchema = new MongoSchema({
    customerId: { type: String, required: true },
    items: {
        type: Array,
        required: true,
        minItems: 1,
        items: {
            type: Object,
            properties: {
                productId: { type: String, required: true },
                quantity: { 
                    type: Number, 
                    required: true,
                    min: 1,
                    max: 99
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        }
    },
    shippingAddress: {
        type: Object,
        required: true,
        properties: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            zipCode: {
                type: String,
                required: true,
                validator: function(value) {
                    return /^\d{5}(-\d{4})?$/.test(value);
                },
                message: 'Invalid ZIP code format'
            },
            country: { 
                type: String, 
                required: true,
                enum: ['US', 'CA', 'UK', 'DE', 'FR']
            }
        }
    }
});
```

## Model Inheritance and Extension

Create base models and extend them for specialized functionality:

### Base Model Pattern

```javascript
// Base schema with common fields
const baseSchema = new MongoSchema({
    createdAt: { type: Date, required: true, default: () => new Date() },
    updatedAt: { type: Date, required: true, default: () => new Date() },
    active: { type: Boolean, required: true, default: true },
    version: { type: Number, required: true, default: 1 }
});

// Base custom methods
const baseCustoms = {
    // Add timestamps
    touch() {
        this.set({ 
            updatedAt: new Date(),
            version: this.data().version + 1
        });
        return this;
    },
    
    // Soft delete
    async softDelete() {
        this.set({ 
            active: false,
            deletedAt: new Date(),
            updatedAt: new Date()
        });
        return await this.save();
    },
    
    // Restore soft deleted
    async restore() {
        this.set({
            active: true,
            deletedAt: null,
            updatedAt: new Date()
        });
        return await this.save();
    },
    
    // Check if record is soft deleted
    isDeleted() {
        return !this.data().active;
    }
};
```

### Extended Models

```javascript
// User model extending base
const userSchema = new MongoSchema({
    ...baseSchema.definition,
    name: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, default: 'user' },
    lastLoginAt: { type: Date }
});

const User = mongomod.createModel({
    db: connection,
    collection: 'users',
    schema: userSchema,
    customs: {
        ...baseCustoms,
        
        // User-specific methods
        async authenticate(password) {
            const bcrypt = await import('bcrypt');
            return bcrypt.compare(password, this.data().passwordHash);
        },
        
        async updateLastLogin() {
            this.set({ lastLoginAt: new Date() });
            this.touch();
            return await this.save();
        },
        
        isAdmin() {
            return this.data().role === 'admin';
        },
        
        async changePassword(newPassword) {
            const bcrypt = await import('bcrypt');
            const hash = await bcrypt.hash(newPassword, 12);
            
            this.set({ 
                passwordHash: hash,
                passwordChangedAt: new Date()
            });
            this.touch();
            return await this.save();
        }
    }
});

// Product model extending base
const productSchema = new MongoSchema({
    ...baseSchema.definition,
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    inventory: { type: Number, required: true, default: 0 },
    tags: { type: Array }
});

const Product = mongomod.createModel({
    db: connection,
    collection: 'products',
    schema: productSchema,
    customs: {
        ...baseCustoms,
        
        // Product-specific methods
        applyDiscount(percentage) {
            const currentPrice = this.data().price;
            const discountedPrice = currentPrice * (1 - percentage / 100);
            
            this.set({ 
                price: discountedPrice,
                originalPrice: currentPrice,
                discountApplied: percentage
            });
            this.touch();
            return this;
        },
        
        async adjustInventory(change) {
            const currentInventory = this.data().inventory;
            const newInventory = currentInventory + change;
            
            if (newInventory < 0) {
                throw new Error('Insufficient inventory');
            }
            
            this.set({ inventory: newInventory });
            this.touch();
            return await this.save();
        },
        
        isInStock() {
            return this.data().inventory > 0;
        },
        
        addTags(tags) {
            const currentTags = this.data().tags || [];
            const newTags = [...new Set([...currentTags, ...tags])];
            
            this.set({ tags: newTags });
            this.touch();
            return this;
        }
    }
});
```

## Advanced Query Patterns

### Complex Filtering and Aggregation

```javascript
class UserService {
    static async getUserAnalytics(filters = {}) {
        return await User.aggregate([
            // Filter stage
            { $match: { active: true, ...filters } },
            
            // Add computed fields
            {
                $addFields: {
                    accountAge: {
                        $divide: [
                            { $subtract: [new Date(), '$createdAt'] },
                            1000 * 60 * 60 * 24 // Convert to days
                        ]
                    }
                }
            },
            
            // Group by role and calculate statistics
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 },
                    avgAccountAge: { $avg: '$accountAge' },
                    lastLoginDates: { $push: '$lastLoginAt' },
                    oldestAccount: { $min: '$createdAt' },
                    newestAccount: { $max: '$createdAt' }
                }
            },
            
            // Sort by count descending
            { $sort: { count: -1 } }
        ]);
    }
    
    static async getActiveUsersWithRecentActivity(days = 30) {
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        
        return await User.findMany({
            filter: {
                active: true,
                lastLoginAt: { $gte: cutoffDate }
            },
            sort: { lastLoginAt: -1 },
        });
    }
    
    static async searchUsers(searchTerm, options = {}) {
        const { limit = 20, skip = 0 } = options;
        
        return await User.findMany({
            filter: {
                active: true,
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { email: { $regex: searchTerm, $options: 'i' } }
                ]
            },
            sort: { name: 1 },
            limit,
            skip,
        });
    }
}
```

### Pagination and Cursor-Based Queries

```javascript
class PaginationHelper {
    static async paginateResults(Model, filter = {}, options = {}) {
        const {
            page = 1,
            limit = 20,
            sort = { createdAt: -1 },
        } = options;
        
        const skip = (page - 1) * limit;
        
        const [results, total] = await Promise.all([
            Model.findMany({
                filter,
                sort,
                limit,
                skip,
            }),
            Model.count({ filter })
        ]);
        
        return {
            data: results,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        };
    }
    
    static async cursorPaginate(Model, filter = {}, options = {}) {
        const {
            cursor,
            limit = 20,
            sort = { _id: 1 },
        } = options;
        
        // Add cursor condition to filter
        let finalFilter = { ...filter };
        if (cursor) {
            const sortField = Object.keys(sort)[0];
            const sortDirection = sort[sortField];
            
            finalFilter[sortField] = sortDirection === 1 
                ? { $gt: cursor }
                : { $lt: cursor };
        }
        
        const results = await Model.findMany({
            filter: finalFilter,
            sort,
            limit: limit + 1, // Get one extra to check if there's a next page
        });
        
        const hasNext = results.length > limit;
        if (hasNext) results.pop(); // Remove the extra item
        
        const nextCursor = results.length > 0 
            ? results[results.length - 1][Object.keys(sort)[0]]
            : null;
        
        return {
            data: results,
            cursor: nextCursor,
            hasNext
        };
    }
}
```

## Event-Driven Architecture

### Advanced Event Patterns

```javascript
// Event manager for cross-model operations
class EventManager {
    static setupUserEvents() {
        User.subscribe('created', this.onUserCreated.bind(this));
        User.subscribe('updated', this.onUserUpdated.bind(this));
        User.subscribe('deleted', this.onUserDeleted.bind(this));
    }
    
    static async onUserCreated(userData) {
        // Create user profile
        await this.createUserProfile(userData);
        
        // Send welcome email
        await this.sendWelcomeEmail(userData);
        
        // Initialize user preferences
        await this.createUserPreferences(userData);
        
        // Track analytics
        await this.trackUserSignup(userData);
    }
    
    static async onUserUpdated(newData, oldData) {
        // Handle email changes
        if (newData.email !== oldData.email) {
            await this.handleEmailChange(newData, oldData);
        }
        
        // Handle role changes
        if (newData.role !== oldData.role) {
            await this.handleRoleChange(newData, oldData);
        }
        
        // Update search index
        await this.updateSearchIndex(newData);
    }
    
    static async onUserDeleted(userData) {
        // Cleanup user data
        await this.cleanupUserData(userData);
        
        // Cancel subscriptions
        await this.cancelSubscriptions(userData);
        
        // Notify team if admin was deleted
        if (userData.role === 'admin') {
            await this.notifyAdminDeletion(userData);
        }
    }
    
    static async createUserProfile(userData) {
        const Profile = mongomod.get('Profile');
        const profile = new Profile().init({
            userId: userData._id,
            displayName: userData.name,
            avatar: null,
            bio: '',
            preferences: {
                theme: 'light',
                notifications: true,
                privacy: 'public'
            }
        });
        await profile.save(true);
    }
    
    static async handleEmailChange(newData, oldData) {
        // Send verification to new email
        await emailService.sendVerification(newData.email);
        
        // Notify old email about change
        await emailService.notifyEmailChange(oldData.email, newData.email);
        
        // Update external services
        await externalServices.updateUserEmail(newData._id, newData.email);
    }
}

// Initialize event system
EventManager.setupUserEvents();
```

### Saga Pattern Implementation

```javascript
// Order processing saga
class OrderSaga {
    static async processOrder(orderData) {
        const steps = [
            this.validateOrder,
            this.checkInventory,
            this.processPayment,
            this.reserveInventory,
            this.createShipment,
            this.sendConfirmation
        ];
        
        const sagaId = generateId();
        let completedSteps = [];
        
        try {
            for (const [index, step] of steps.entries()) {
                console.log(`Executing step ${index + 1}: ${step.name}`);
                
                const result = await step(orderData, sagaId);
                completedSteps.push({ step: step.name, result });
                
                // Save progress
                await this.saveSagaProgress(sagaId, completedSteps);
            }
            
            console.log('Order processing completed successfully');
            return { success: true, sagaId, steps: completedSteps };
            
        } catch (error) {
            console.error('Order processing failed:', error);
            
            // Compensate completed steps in reverse order
            await this.compensate(completedSteps.reverse(), orderData, sagaId);
            
            return { success: false, error: error.message, sagaId };
        }
    }
    
    static async compensate(completedSteps, orderData, sagaId) {
        console.log('Starting compensation process...');
        
        for (const { step, result } of completedSteps) {
            try {
                await this.compensateStep(step, result, orderData);
                console.log(`Compensated step: ${step}`);
            } catch (compensationError) {
                console.error(`Failed to compensate step ${step}:`, compensationError);
                // Log for manual intervention
                await this.logCompensationFailure(sagaId, step, compensationError);
            }
        }
    }
    
    static async validateOrder(orderData) {
        // Validation logic
        if (!orderData.items || orderData.items.length === 0) {
            throw new Error('Order must have at least one item');
        }
        
        return { validated: true };
    }
    
    static async checkInventory(orderData) {
        const Product = mongomod.get('Product');
        
        for (const item of orderData.items) {
            const product = await Product.findOne({ filter: { _id: item.productId } });
            
            if (!product || product.inventory < item.quantity) {
                throw new Error(`Insufficient inventory for product ${item.productId}`);
            }
        }
        
        return { inventoryChecked: true };
    }
    
    static async processPayment(orderData) {
        // Payment processing logic
        const paymentResult = await paymentService.charge(
            orderData.paymentMethod,
            orderData.totalAmount
        );
        
        if (!paymentResult.success) {
            throw new Error('Payment processing failed');
        }
        
        return { paymentId: paymentResult.id, charged: orderData.totalAmount };
    }
    
    // Additional steps and compensation methods...
}
```

## Performance Optimization

### Connection Pooling and Caching

```javascript
// Connection manager with pooling
class DatabaseManager {
    constructor() {
        this.connections = new Map();
        this.cache = new Map();
    }
    
    async getConnection(dbName) {
        if (!this.connections.has(dbName)) {
            const connection = new mongomod.Connection({
                link: process.env.MONGO_HOST,
                login: process.env.MONGO_USER,
                password: process.env.MONGO_PASSWORD,
                dbName
            });
            
            await connection.connect();
            this.connections.set(dbName, connection);
        }
        
        return this.connections.get(dbName);
    }
    
    // Simple in-memory cache
    cache(key, value, ttl = 300) { // 5 minutes default
        if (value === undefined) {
            const cached = this.cache.get(key);
            if (cached && cached.expires > Date.now()) {
                return cached.value;
            }
            return null;
        }
        
        this.cache.set(key, {
            value,
            expires: Date.now() + (ttl * 1000)
        });
    }
    
    async disconnect() {
        for (const connection of this.connections.values()) {
            await connection.disconnect();
        }
        this.connections.clear();
        this.cache.clear();
    }
}
```

### Bulk Operations for Performance

```javascript
class BulkOperationHelper {
    static async bulkCreateUsers(usersData, batchSize = 1000) {
        const results = [];
        
        // Process in batches to avoid memory issues
        for (let i = 0; i < usersData.length; i += batchSize) {
            const batch = usersData.slice(i, i + batchSize);
            
            const result = await User.insertMany({ data: batch });
            results.push(...result.insertedIds);
            
            console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(usersData.length / batchSize)}`);
        }
        
        return results;
    }
    
    static async bulkUpdateUserStatuses(userIds, newStatus) {
        return await User.updateMany({
            filter: { _id: { $in: userIds } },
            update: { 
                $set: { 
                    status: newStatus,
                    updatedAt: new Date()
                }
            }
        });
    }
    
    static async bulkMigrateData(fromCollection, toCollection, transformFn) {
        const batchSize = 1000;
        let processedCount = 0;
        
        // Use cursor for memory efficiency
        const FromModel = mongomod.get(fromCollection);
        const ToModel = mongomod.get(toCollection);
        
        const totalCount = await FromModel.count({ filter: {} });
        
        let skip = 0;
        while (skip < totalCount) {
            const batch = await FromModel.findMany({
                filter: {},
                sort: { _id: 1 },
                limit: batchSize,
                skip
            });
            
            if (batch.length === 0) break;
            
            // Transform data
            const transformedBatch = batch.map(transformFn);
            
            // Insert to new collection
            await ToModel.insertMany({ data: transformedBatch });
            
            processedCount += batch.length;
            skip += batchSize;
            
            console.log(`Migrated ${processedCount}/${totalCount} records`);
        }
        
        return processedCount;
    }
}
```

## Testing Patterns

### Model Testing Utilities

```javascript
// test/helpers/modelHelpers.js
export class ModelTestHelper {
    static async createTestUser(overrides = {}) {
        const userData = {
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            role: 'user',
            active: true,
            ...overrides
        };
        
        const user = new User().init(userData);
        await user.save(true);
        return user;
    }
    
    static async cleanup() {
        // Clean up test data
        await User.deleteMany({ filter: { email: { $regex: 'test.*@example.com' } } });
        await Product.deleteMany({ filter: { name: { $regex: '^Test.*' } } });
    }
    
    static async seedTestData() {
        // Create test users
        const users = await Promise.all([
            this.createTestUser({ name: 'Admin User', role: 'admin' }),
            this.createTestUser({ name: 'Regular User', role: 'user' }),
            this.createTestUser({ name: 'Inactive User', active: false })
        ]);
        
        return { users };
    }
}
```

This advanced usage guide demonstrates sophisticated patterns that leverage MongoMod's full capabilities while maintaining clean, maintainable code architecture.