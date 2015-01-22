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

#### `service.read(id, params, callback)`

#### `service.readMany(ids, params, callback)`

#### `service.findMany(params, callback)`

#### `service.find(..., callback)`

#### `service.create(model, params, callback)`

#### `service.update(model, params, callback)`

#### `service.updateMany(models, params, callback)`

#### `service.save(..., params, callback)`

#### `service.delete(id, params, data, callback)`

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
  filter: {
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
