# Error Handling

MongoMod provides specific error types for different scenarios to help you handle errors gracefully and debug issues effectively.

## Error Types

MongoMod includes four main error types, each designed for specific failure scenarios:

### MmConnectionError

Thrown when database connection operations fail.

```javascript
import { MmConnectionError } from 'mongomod';

try {
    const connection = new mongomod.Connection({
        link: 'invalid-host:27017',
        dbName: 'myapp'
    });
    await connection.connect();
} catch (error) {
    if (error instanceof MmConnectionError) {
        console.error('Connection failed:', error.message);
        // Handle connection error - retry, fallback, etc.
    }
}
```

**Common causes:**
- Invalid MongoDB host or port
- Network connectivity issues
- Authentication failures
- Database not accessible

### MmValidationError

Thrown when schema validation fails.

```javascript
import { MmValidationError } from 'mongomod';

try {
    const user = new User().init({
        name: 'John', // Missing required email field
        age: 'invalid' // Invalid type
    });
} catch (error) {
    if (error instanceof MmValidationError) {
        console.error('Validation failed:', error.message);
        console.error('Validation errors:', error.errors);
        
        // Handle validation error
        return {
            success: false,
            errors: error.errors
        };
    }
}
```

**Properties:**
- `message`: General error message
- `errors`: Object containing field-specific validation errors

### MmOperationError

Thrown when database operations fail or when expected data is not found.

```javascript
import { MmOperationError } from 'mongomod';

try {
    const user = new User();
    await user.get({ email: 'nonexistent@example.com' });
} catch (error) {
    if (error instanceof MmOperationError) {
        console.error('Operation failed:', error.message);
        // Handle operation error - document not found, etc.
    }
}
```

**Common causes:**
- Document not found during get operations
- Invalid query parameters
- Database operation failures

### MmControllerError

Thrown when low-level controller operations fail.

```javascript
import { MmControllerError } from 'mongomod';

try {
    const controller = new mongomod.Controller(db, 'users');
    await controller.findOne({
        filter: { $invalidOperator: 'value' }
    });
} catch (error) {
    if (error instanceof MmControllerError) {
        console.error('Controller operation failed:', error.message);
        // Handle controller error
    }
}
```

**Common causes:**
- Invalid MongoDB query syntax
- Database permissions issues
- Collection access problems

## Error Handling Patterns

### Basic Error Handling

```javascript
async function createUser(userData) {
    try {
        const user = new User().init(userData);
        await user.save(true);
        return { success: true, user };
    } catch (error) {
        if (error instanceof MmValidationError) {
            return {
                success: false,
                type: 'validation',
                errors: error.errors
            };
        }
        
        if (error instanceof MmOperationError) {
            return {
                success: false,
                type: 'operation',
                message: error.message
            };
        }
        
        // Unexpected error
        console.error('Unexpected error:', error);
        return {
            success: false,
            type: 'unknown',
            message: 'An unexpected error occurred'
        };
    }
}
```

### Comprehensive Error Handler

```javascript
class ErrorHandler {
    static handle(error, context = '') {
        const errorInfo = {
            timestamp: new Date().toISOString(),
            context,
            type: error.constructor.name,
            message: error.message
        };
        
        if (error instanceof MmConnectionError) {
            return this.handleConnectionError(error, errorInfo);
        }
        
        if (error instanceof MmValidationError) {
            return this.handleValidationError(error, errorInfo);
        }
        
        if (error instanceof MmOperationError) {
            return this.handleOperationError(error, errorInfo);
        }
        
        if (error instanceof MmControllerError) {
            return this.handleControllerError(error, errorInfo);
        }
        
        return this.handleUnknownError(error, errorInfo);
    }
    
    static handleConnectionError(error, info) {
        console.error('Connection Error:', info);
        
        // Log for monitoring
        this.logError('CONNECTION_ERROR', info);
        
        return {
            success: false,
            type: 'connection',
            message: 'Database connection failed',
            retryable: true,
            severity: 'high'
        };
    }
    
    static handleValidationError(error, info) {
        console.warn('Validation Error:', info);
        
        return {
            success: false,
            type: 'validation',
            message: 'Data validation failed',
            errors: error.errors,
            retryable: false,
            severity: 'low'
        };
    }
    
    static handleOperationError(error, info) {
        console.error('Operation Error:', info);
        
        this.logError('OPERATION_ERROR', info);
        
        return {
            success: false,
            type: 'operation',
            message: error.message,
            retryable: false,
            severity: 'medium'
        };
    }
    
    static handleControllerError(error, info) {
        console.error('Controller Error:', info);
        
        this.logError('CONTROLLER_ERROR', info);
        
        return {
            success: false,
            type: 'controller',
            message: 'Database operation failed',
            retryable: true,
            severity: 'high'
        };
    }
    
    static handleUnknownError(error, info) {
        console.error('Unknown Error:', info, error.stack);
        
        this.logError('UNKNOWN_ERROR', { ...info, stack: error.stack });
        
        return {
            success: false,
            type: 'unknown',
            message: 'An unexpected error occurred',
            retryable: false,
            severity: 'high'
        };
    }
    
    static logError(type, info) {
        // Send to logging service, monitoring, etc.
        // Example: await logService.error(type, info);
    }
}

// Usage
try {
    const result = await someOperation();
} catch (error) {
    const errorResponse = ErrorHandler.handle(error, 'user-creation');
    return res.status(errorResponse.severity === 'high' ? 500 : 400)
              .json(errorResponse);
}
```

### Retry Logic

```javascript
class RetryHelper {
    static async withRetry(operation, options = {}) {
        const {
            maxAttempts = 3,
            delayMs = 1000,
            exponentialBackoff = true,
            retryableErrors = [MmConnectionError, MmControllerError]
        } = options;
        
        let lastError;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                
                // Check if error is retryable
                const isRetryable = retryableErrors.some(
                    ErrorClass => error instanceof ErrorClass
                );
                
                if (!isRetryable || attempt === maxAttempts) {
                    throw error;
                }
                
                // Calculate delay
                let delay = delayMs;
                if (exponentialBackoff) {
                    delay = delayMs * Math.pow(2, attempt - 1);
                }
                
                console.warn(
                    `Operation failed (attempt ${attempt}/${maxAttempts}). ` +
                    `Retrying in ${delay}ms...`, 
                    error.message
                );
                
                await this.delay(delay);
            }
        }
        
        throw lastError;
    }
    
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Usage
const user = await RetryHelper.withRetry(async () => {
    return await User.findOne({ filter: { email: 'user@example.com' } });
}, {
    maxAttempts: 3,
    delayMs: 1000,
    exponentialBackoff: true
});
```

### Circuit Breaker Pattern

```javascript
class CircuitBreaker {
    constructor(options = {}) {
        this.failureThreshold = options.failureThreshold || 5;
        this.resetTimeout = options.resetTimeout || 60000; // 1 minute
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.failureCount = 0;
        this.lastFailureTime = null;
    }
    
    async execute(operation) {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime < this.resetTimeout) {
                throw new Error('Circuit breaker is OPEN');
            } else {
                this.state = 'HALF_OPEN';
            }
        }
        
        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }
    
    onSuccess() {
        this.failureCount = 0;
        this.state = 'CLOSED';
    }
    
    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        
        if (this.failureCount >= this.failureThreshold) {
            this.state = 'OPEN';
        }
    }
}

// Usage
const dbCircuitBreaker = new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 60000
});

async function getUser(email) {
    try {
        return await dbCircuitBreaker.execute(async () => {
            return await User.findOne({ filter: { email } });
        });
    } catch (error) {
        if (error.message === 'Circuit breaker is OPEN') {
            // Return cached data or default response
            return getCachedUser(email);
        }
        throw error;
    }
}
```

## Validation Error Handling

### Field-Level Validation

```javascript
function validateUser(userData) {
    try {
        const user = new User().init(userData);
        return { valid: true, user };
    } catch (error) {
        if (error instanceof MmValidationError) {
            // Transform errors for API response
            const fieldErrors = {};
            
            for (const [field, message] of Object.entries(error.errors)) {
                fieldErrors[field] = {
                    message,
                    value: userData[field],
                    required: true // Could be determined from schema
                };
            }
            
            return {
                valid: false,
                errors: fieldErrors
            };
        }
        throw error;
    }
}

// Usage
const validation = validateUser({
    name: '',
    email: 'invalid-email',
    age: -1
});

if (!validation.valid) {
    console.log('Validation errors:', validation.errors);
    /*
    {
      name: { message: 'Field is required', value: '', required: true },
      email: { message: 'Must be valid email', value: 'invalid-email', required: true },
      age: { message: 'Must be positive number', value: -1, required: false }
    }
    */
}
```

### Custom Validation Messages

```javascript
const userSchema = new MongoSchema({
    email: {
        type: String,
        required: true,
        validator: function(value) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: 'Please provide a valid email address'
    },
    age: {
        type: Number,
        required: true,
        validator: function(value) {
            return value >= 13 && value <= 120;
        },
        message: 'Age must be between 13 and 120 years'
    }
});
```

## Production Error Monitoring

### Error Logging Service

```javascript
class ErrorLogger {
    static async log(error, context = {}) {
        const errorData = {
            timestamp: new Date().toISOString(),
            type: error.constructor.name,
            message: error.message,
            stack: error.stack,
            context,
            environment: process.env.NODE_ENV,
            version: process.env.APP_VERSION
        };
        
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error logged:', errorData);
        }
        
        // Send to external logging service
        try {
            await this.sendToExternalService(errorData);
        } catch (loggingError) {
            console.error('Failed to log error:', loggingError);
        }
        
        // Store in database for analysis
        try {
            await this.storeErrorInDB(errorData);
        } catch (dbError) {
            console.error('Failed to store error in DB:', dbError);
        }
    }
    
    static async sendToExternalService(errorData) {
        // Example: Send to service like Sentry, LogRocket, etc.
        // await sentry.captureException(errorData);
    }
    
    static async storeErrorInDB(errorData) {
        const ErrorLog = mongomod.get('ErrorLog');
        if (ErrorLog) {
            await ErrorLog.insertOne(errorData);
        }
    }
}

// Usage in error handlers
try {
    await someOperation();
} catch (error) {
    await ErrorLogger.log(error, {
        operation: 'user-creation',
        userId: req.user?.id,
        ip: req.ip
    });
    throw error;
}
```

### Health Check Endpoint

```javascript
class HealthCheck {
    static async getDatabaseHealth() {
        try {
            // Test basic connectivity
            const connection = mongomod.get('connection'); // Your main connection
            if (!connection.isConnected) {
                return { status: 'unhealthy', reason: 'Database not connected' };
            }
            
            // Test read operation
            const testResult = await User.count({ filter: {} });
            
            // Test write operation
            const testDoc = new User().init({
                name: 'health-check',
                email: `health-check-${Date.now()}@test.com`,
                temporary: true
            });
            await testDoc.save(true);
            await testDoc.delete();
            
            return { 
                status: 'healthy',
                userCount: testResult,
                lastCheck: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                type: error.constructor.name,
                lastCheck: new Date().toISOString()
            };
        }
    }
}

// Express endpoint
app.get('/health', async (req, res) => {
    const dbHealth = await HealthCheck.getDatabaseHealth();
    const status = dbHealth.status === 'healthy' ? 200 : 503;
    
    res.status(status).json({
        service: 'MongoMod App',
        database: dbHealth,
        timestamp: new Date().toISOString()
    });
});
```

## Best Practices

### 1. Use Specific Error Types

```javascript
// Good: Specific error handling
if (error instanceof MmValidationError) {
    return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
    });
}

// Avoid: Generic error handling
if (error.name === 'ValidationError') {
    // Less reliable
}
```

### 2. Provide User-Friendly Messages

```javascript
function formatErrorForUser(error) {
    if (error instanceof MmValidationError) {
        return {
            message: 'Please check your input and try again.',
            fields: error.errors
        };
    }
    
    if (error instanceof MmConnectionError) {
        return {
            message: 'We\'re experiencing technical difficulties. Please try again later.'
        };
    }
    
    return {
        message: 'Something went wrong. Please contact support if the problem persists.'
    };
}
```

### 3. Log Errors Appropriately

```javascript
// Log validation errors as warnings (user error)
if (error instanceof MmValidationError) {
    console.warn('Validation failed:', error.errors);
}

// Log system errors as errors (system issue)
if (error instanceof MmConnectionError) {
    console.error('Database connection failed:', error.message);
}
```

### 4. Handle Errors at the Right Level

```javascript
// Handle specific errors in business logic
async function createUser(userData) {
    try {
        const user = new User().init(userData);
        return await user.save(true);
    } catch (error) {
        if (error instanceof MmValidationError) {
            // Handle validation here - this is expected
            throw new Error('Invalid user data provided');
        }
        // Let other errors bubble up to global handler
        throw error;
    }
}

// Handle unexpected errors globally
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    ErrorLogger.log(reason, { type: 'unhandled_rejection' });
});
```

By following these error handling patterns, you can build robust applications that gracefully handle failures and provide excellent user experiences even when things go wrong.