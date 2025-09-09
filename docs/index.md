---
layout: home

hero:
  name: "MongoMod"
  text: "MongoDB ODM for Node.js"
  tagline: "A powerful MongoDB model-based library with TypeScript support"
  image:
    src: /logo.png
    alt: MongoMod
  actions:
    - theme: brand
      text: Get Started
      link: /quick-start
    - theme: alt
      text: View on GitHub
      link: https://github.com/lesha2r/mongomod

features:
  - icon: 🏗️
    title: Model-Based Architecture
    details: Define reusable models with schema validation for structured data management.
  - icon: ✅
    title: Schema Validation
    details: Built-in validation using the validno library ensures data integrity.
  - icon: ⚡
    title: Custom Methods
    details: Extend models with your own custom functionality and business logic.
  - icon: 🎯
    title: Event System
    details: Subscribe to model lifecycle events (create, update, delete) for reactive programming.
  - icon: 📊
    title: Full MongoDB Support
    details: Complete CRUD operations, aggregation, indexing, and more advanced MongoDB features.
  - icon: 🔷
    title: TypeScript Support
    details: Full TypeScript definitions and type safety for modern development.
  - icon: 🔗
    title: Connection Management
    details: Robust connection handling with timeout and error management.
  - icon: 🛠️
    title: Flexible API
    details: Both static and instance methods provide flexibility for different use cases.
---

## Why MongoMod?

MongoMod is a feature-rich MongoDB ODM (Object Document Mapper) that provides an intuitive, model-based approach to working with MongoDB databases. It combines the flexibility of MongoDB with the structure and safety of schema validation, custom methods, and event-driven programming.

## Quick Example

```javascript
import mongomod from 'mongomod';

// Create connection
const db = new mongomod.Connection({
    link: 'localhost:27017',
    dbName: 'myapp'
});
await db.connect();

// Define schema
const userSchema = new mongomod.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number }
});

// Create model with custom methods
const User = mongomod.createModel({
    db: db,
    collection: 'users',
    schema: userSchema,
    customs: {
        getFullInfo() {
            return `${this.data().name} (${this.data().email})`;
        }
    }
});

// Use the model
const user = new User().init({
    name: 'John Doe',
    email: 'john@example.com',
    age: 25
});

await user.save(true);
console.log(user.getFullInfo()); // "John Doe (john@example.com)"
```

## Installation

```bash
npm install mongomod
```

::: tip Version 2.0+
Version 2.0.0 introduces breaking changes. See the [Migration Guide](/migration-guide) for upgrading from earlier versions.
:::