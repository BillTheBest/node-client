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

### Websockets

Websockets is supported through the node library.

Note: As of yet, we do not support promises through the websockets library.

You can enable a websockets session with the websockets connect method,
as you would with any other service.

```js

api.webSocket.connect()

```

The connection method doesn't return anything.

Rather, you can interface with the websocket connection through a callback.

The callback takes one argument, which gives you access to the websocket object. We've used the [ws](https://github.com/websockets/ws) library to handle our websockets, so you can use any of their methods that you wish. But, we've also added our own convenience methods.

```js

api.webSocket.connect(function(flowthingsWs) {

  // To subscribe to a flow, you could use the built in ws methods.
  flowthingsWs.on('open', function open() {
    flowthingsWs.send('{"msgId": "my-request","object": "drop","type": "subscribe","flowId": "f54f8c0840cf2738763fd8a56"}');
  });

  // However, you could also use our convenience methods.
  flowthingsWs.flow.subscribe("f54f8c0840cf2738763fd8a56")

})

```

Flow, track and drop each have CRUD methods on them. Flow has an additional method to subscribe to the flow over websockets.

The methods take the following arguments:

```js
ws.flow.subscribe(id, params, messageHandler, callback, listener)
```

* id is the id of the flow you're subscribing to.
* params are various parameters you can set (the only important one for now is msgId).
* messageHandler is a callback function, we'll execute it when messages (drops) come in from the subscribed to flow.
* callback is the callback that is executed after the data is sent, but before anything is recieved.
* listener will listen for an incomming message from the platform that will tell you if the subscription has succeeded or failed.

The other methods are similar:

```js
ws.flow.create(obj, params, listener, cb)
```

* obj is the object that you're creating.

And the other arguments work the same as the subscription.

Drop create is slightly different:

```js
ws.drop.create(id, obj, params, listener, cb)
```

* id is the flowId for drop.create.

Then we have:

```js
ws.flow.read(id, params, listener, cb)
```

```js
ws.flow.update(id, obj, params, listener, cb)
```

```js
ws.flow.delete(id, params, listener, cb)
```

The arguments work generally as you would expect for each of these. Track and drop work the same as flow, however, drop takes an array for the id in read, update and delete: [flowId, dropId].

Note: There is currently a bug with how we set listeners. We need to fix this, but until then, set as few as possible. If you're setting too many, the system will warn you. We're going to fix this (I promise) in the next week or so.
