flowthings-node-client
======================

### `flowthings.API(credentials, options)`

Returns a new `API` instance for interacting with the platform.

```js
var creds = {
  account: '<account_name>',
  token: '<token_string>'
};
var api = flowthings.API(creds);
```

[API defaults](#default-options) may be overriden using the `options` hash.

An `API` is comprised of services for querying the different domains of the
platform:

-   `flow`
-   `drop`
-   `track`
-   `group`
-   `identity`
-   `token`
-   `share`
-   `apiTask`
-   `mqtt`

For documentation on these services, read [Service Methods](#service-methods).

### Default Options

You can change the default options for all APIs globally by mutating the
`flowthings.defaults` hash.

-   **`secure`**: Defaults to `true`. When set to `false`, requests will be
    made over `http` rather than `https`.
-   **`params`**: The default set of query string parameters sent with all
    requests. Defaults to `{}`.

### Service Methods

All `API` service requests return plain objects of the request body.

#### `service.read(id, params?, callback)`

```js
api.flow.read('<flow_id>', function(err, res) { ... });
```

#### `service.readMany(ids, params?, callback)`

```js
api.flow.readMany(['<flow_id_1>', '<flow_id_2>'], function(err, res) { ... });
```

#### `service.findMany(params?, callback)`

```js
api.flow.findMany({ filter: { path: '/foo/bar' }}, function(err, res) { ... });
```

#### `service.find(..., callback)`

An overloaded method which may call one of `read`, `readMany`, or `findMany`
depending upon the type of the first argument.

#### `service.create(model, params?, callback)`

```js
api.flow.create({ path: '/foo/bar' }, function(err, res) { ... });
```

#### `service.update(model, params?, callback)`

Requests are made based on the model's `id` property.

```js
api.flow.update({ id: '<flow_id>', capacity: 10 }, function(err, res) { ... });
```

#### `service.updateMany(models, params?, callback)`

```js
api.flow.updateMany([model1, model2, model3], function(err, res) { ... });
```

#### `service.save(..., params?, callback)`

An overloaded method which may call one of `create`, `update`, or `updateMany`
depending upon the type of the first argument. `create` or `update` are called
based on the presence of an `id` property.

#### `service.delete(id, params?, data?, callback)`

```js
api.flow.delete('<flow_id>', function(err, res) { ... });
```

**Note:** The `drop` service is slightly different in that it must first be
parameterized by the Flow id.

```js
api.drop('<flow_id>').find({ limit: 10 });
```

**Note:** Not all services support all the methods. `share`s and `token`s are
immutable, and so do not support `update`, `updateMany`, and `save`.
`identity` only supports `read`, `readMany`, `findMany`, and `find`.

### Request Parameters

When a request is made with the `refs` parameter set to `true`, the return
value becomes an array with two items: the response body and the references.

```js
api.flow.find('<flow_id>', { refs: true }, function(err, resp) {
  var flow = resp[0];
  var refs = resp[1];
  // ...
});
```

Request `filter`s may be expressed using a Mongo-like DSL:

```js
api.flow.find({
  criteria: {
    prop1: 'foo',       // equals
    prop2: /foo/i,      // regular expression matching
    prop3: { $lt: 42 },  // Less than
    prop4: { $lte: 42 }, // Less than or equal
    prop5: { $gt: 42 },  // Greater than
    prop6: { $gte: 42 }  // Greater than or equal
  }
}, function(err, resp) {
  // ...
});
```

Other parameters are not fixed in any way, so please refer to the platform
documentation for more.

### Errors

Callbacks receive an error for any non-ok HTTP response from the platform.

-   `flowthings.FlowThingsError`
-   `flowthings.FlowThingsBadRequest`
-   `flowthings.FlowThingsForbidden`
-   `flowthings.FlowThingsNotFound`
-   `flowthings.FlowThingsServerError`

The special-cased error classes are subclasses of `FlowThingsError`. All have
the following properties:

-    **`creds`**: The credentials used to make the request
-    **`status`**: The status code of the response
-    **`errors`**: The error array returned by the platform

### Promises

A promise-based `API` is supported through the `flowthings.promisify` request
transformer.

```js
var Promise = require('bluebird');
var api = flowthings.API(creds, {
  transform: flowthings.promisify(Promise)
});

api.flow.find()
  .then(function(flows) {
    // ...
  })
  .catch(function(err) {
    // ...
  });
```
