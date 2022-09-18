Just a model-styled driver to work with MongoDB. Supports models, schemes, validations and custom methods for models.

# Installation
```
npm i mongomod
```

# Usage
To have an optimal level of control follow these steps:
1. Create a connection (Connection class)
2. Create a schema for a model (Schema class) *[optional]*
3. Create a model (createModel function)
4. Finally, create you object as instance of model (new Model())

## Create a connection
Initialize a connection which will allow all other stuff to be in touch with a database.

### mongomod.Connection(options)
* `options` (Object) — connection parameters
* `options.link` (String) — mongo connection link
* `options.login` (String) — mongo login
* `options.password` (String) — mongo password
* `options.dbName` (String) — mongo database name
* `options.debug` (Boolean) — enable/disable debugging messages in console *[default: false]*
* `options.srv` (Boolean) — enable/disable srv in connection string *[default: true]*
```
import mongomod from 'mongomod';

let db = new mongomod.Connection({
    link: 'your.link.mongodb.net',
    login: 'your_login',
    password: 'your_password',
    dbName: 'test'
});
```

Now you can open a connection...
```
await db.connect()
```

... and close it when needed
```
db.disconnect()
```

## Create a schema (optional)
Next up you may create a schema for a model that you are going to work with. This is an optional step so you may skip it if you don't want to validate data of your Model instances.

### mongomod.Schema(schemaObj, options)
* `schemeObj` (Object) — object describing future model schema
* `options` (Object) — additional parameters
* `options.strict` (Boolean) — set true if you would like to follow schema in a strict way (all unwanted parameters are removed) *[default: false]*
* `options.debug` (Boolean) — enable/disable debuggin messages in console *[default: false]*

Create it like this:

```
import mongomod from 'mongomod';

let userSchema = new mongomod.Schema({
    name: 'string',
    age: ['number', 'null'],
    address: {
        city: 'string',
        coordinates: {
            x: 'number',
            y: 'number'
        }
    },
    education: ['object', 'null'],
    friends: 'array'
});
```
### Allowed types:
Choose only one type for a field...

1. any
2. string
3. number
4. object
5. array
6. date
7. boolean
8. null

or combine them using an array like *{ city: ['string', 'null'] }*

## Create a model
Now you are ready to create your first Model. Use crateModel function. Let's see how it works.

### mongomod.createModel(db, collection, schema)
Creates an object that will be using for constructing a new instances of a Model.

* `db` (Object) — connection object created by MongoConnection class
* `collection` (String) — name of collection that your model going to be linked to
* `schema` (Object) — schema object created by MongoScheme class... or nothing *[default: null]*

```
import mongomod from 'mongomod';

let UserModel = mongomod.createModel(db, 'users', userSchema)
```

Don't pass schema if you don't really need it:
```
// This will work...
let UserModel = mongomod.createModel(db, 'users')
// ...but schema is now your responsibility ;)
```

So the complete algorithm will be the following:
```
import mongomod from 'mongomod';

let db = new mongomod.Connection({
    link: 'your.link.mongodb.net',
    login: 'your_login',
    password: 'your_password',
    dbName: 'test'
});

let userSchema = new mongomod.Schema({
    name: 'string',
    lastName: 'string',
    age: ['number', 'null'],
    address: {
        city: 'string',
        coordinates: {
            x: 'number',
            y: 'number'
        }
    },
    education: ['object', 'null'],
    friends: 'array'
});

let User = createdModel(db, 'users', userSchema)
```

Great! If zero errors were thrown, you did everything right. Let's see what functionality does you Model have.

## How to work with a Model
### Model.init(data)
Allows to create new user with the data passed as an object.

* `data` (Object) — data for a model instance

```
let barneyStinson = new User()

barneyStinson.init({
    "name": "Barney",
    "lastName": "Stinson",
})
```

### Model.set(data)
Updates current item data without saving/inserting changes to the database. Merges existing data with a new set like { ... oldData, ...newData }

* data (Object) — object containing changes

```
user.set({ age: 38 })
```

### Model.insert()
Inserts current item to the database. Use await as this method is asynchronous.

```
await user.insert()
```

### Model.get(query)
Pulls data from the database using a query object. Use await as this method is asynchronous.

* query (Object) — regular MongoDB query

Previously we worked with new user that was created, updated, inserted. Let's see how to work with an existing user. First of all, create an instance of User model. Use Model.get(query) method to retrieve it from the database.

```
let user = new User()

await user.get({ name: 'Barney', lastName: 'Stinson' });

// user is now linked to the fetched user
```

### Model.save(isNew)
Saves current user to the database.

* isNew (Boolean) — force to insert as a new document *[default: false]*

```
// Update document in the database...
await user.save()

// ... or insert it as a new one
await user.save(true) // same as user.insert()
```

### Model.delete()
Delets user in the database.

```
await user.delete()
```

### Model.validate()
Validates item by a Schema specified.

You may check if the document mathes its Model Schema.

```
user.validate() // returns true or false
```

### Model.clearBySchema()
Deletes all data that doesn't match the Schema.

```
console.log(barneyStinson.modelData)

//{
//    "name": "Barney",
//    "lastName": "Stinson",
//    "isLegendary": true
//}

// Ops! We don't expect that User Model has "isLegendary" field.
// Let's force data to exclude everything except Schema's fields

user.clearBySchema()

console.log(barneyStinson.modelData)
//{
//    "name": "Barney",
//    "lastName": "Stinson",
//}

// Great!
```