# Installation

## Prerequisites

- Node.js 16.0 or higher
- MongoDB 4.0 or higher
- TypeScript 4.0 or higher (optional, for TypeScript projects)

## Package Installation

Install MongoMod using npm:

```bash
npm install mongomod
```

Or using yarn:

```bash
yarn add mongomod
```

Or using pnpm:

```bash
pnpm add mongomod
```

## Dependencies

MongoMod comes with the following key dependencies:

- **mongodb**: Official MongoDB driver for Node.js
- **validno**: Schema validation library
- **lodash**: Utility library for data manipulation

These are automatically installed when you install MongoMod.

## TypeScript Setup

If you're using TypeScript, MongoMod includes full type definitions out of the box. No additional `@types` packages are needed.

Add the following to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true
  }
}
```

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

## Verification

To verify your installation, create a simple test file:

```javascript
// test-installation.js
import mongomod from 'mongomod';

console.log('MongoMod version:', require('mongomod/package.json').version);
console.log('Available components:', Object.keys(mongomod));
```

Run the test:

```bash
node test-installation.js
```

You should see output similar to:

```
MongoMod version: 2.1.1
Available components: ['Connection', 'Schema', 'Controller', 'Model', 'createModel', 'models', 'get']
```

## Next Steps

Once installation is complete, proceed to the [Quick Start](/quick-start) guide to begin using MongoMod in your project.