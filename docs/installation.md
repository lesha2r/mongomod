# Installation

## Prerequisites

- MongoDB 4.0 or higher
- TypeScript 4.0 or higher (optional, for TypeScript projects)

## Package Installation

Install MongoMod using npm:

```bash
npm install mongomod
```

## Dependencies

MongoMod comes with the following key dependencies:

- **mongodb**: Official MongoDB driver for Node.js
- **validno**: Schema validation library
- **lodash**: Utility library for data manipulation

## TypeScript Setup

If you're using TypeScript, MongoMod includes full type definitions out of the box. No additional `@types` packages are needed.

## Module System

MongoMod uses ES modules. Make sure your `package.json` includes:

```json
{
  "type": "module"
}
```

## Import Syntax

### ES Modules (Recommended)

```javascript
import mongomod from 'mongomod';
import { MongoSchema, MongoConnection, MongoModel } from 'mongomod';
```

### CommonJS (Legacy)

If you need to use CommonJS:

```javascript
const mongomod = require('mongomod').default;
const { MongoSchema, MongoConnection, MongoModel } = require('mongomod');
```

## Next Steps

Once installation is complete, proceed to the [Quick Start](/quick-start) guide to begin using MongoMod in your project.