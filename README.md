flowthings-node-client
======================

The node library for [flowthings.io](https://flowthings.io/).

See the documentation for the platform [here](https://flowthings.io/docs/index). And, if you have futher questions, don't hesitate to go to our [support forum](https://flowthings.io/support).

[![NPM](https://nodei.co/npm/flowthings.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/flowthings/)

### Installation

The node client is available via npm:

```shell
npm install flowthings
```

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
-   `rss`

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

#### `drop(flowId).aggregate(data, params?, callback)`

Drops also support our [aggregation endpoint](https://flowthings.io/docs/flow-drop-aggregate).

```js
api.drop('<flow_id>').aggregate({
  "filter":"",
  "groupBy":[],
  "output": ["$count", "$avg:foo"],
  "rules":{}
}, function(err, res) {
  if (err) console.log("error: ", err)
  if (res) console.log("res: ", res)
})
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

The callback takes one argument, which gives you access to the websocket object. We've used the [ws](https://github.com/websockets/ws) library to handle our websockets connections. But we've abstracted it away with our own higher level logic. We handle reconnection and nearly everything else.

```js
api.webSocket.connect(function(flowthingsWs) {

  // To subscribe to a flow, you use the subscribe method
  flowthingsWs.flow.subscribe("f54f8c0840cf2738763fd8a56", function(drop){
    console.log("drop", drop)
  }, function() {
    console.log('connected')
  })

  flowthingsWs.drop("f54f8c0840cf2738763fd8a56").create({elems:{"name": "drop"}}, function() {
      console.log('drop created')
  })

})
```

Flow, track and drop each have CRUD methods on them. Flow has an additional method to subscribe to the flow over websockets.

The methods take the following arguments:

#### `ws.flow.subscribe(id, params, dropListener, responseHandler, callback)`

* id is the id of the flow you're subscribing to.
* params are various parameters you can set (the only important one for now is msgId).
* dropListener(drop) is a callback function, we'll execute it when messages (drops) come in from the subscribed to flow.
* responseHandler(response, response.head.msgId, flags) will listen for an incomming message from the platform that will tell you if the subscription has succeeded or failed.
* callback() is the callback that is executed after the data is sent, but before anything is recieved.

The other methods are similar:

#### `ws.flow.subscribe(id, params, responseHandler, callback)`

This is the sister to subscriptions. It will start

#### `ws.flow.create(obj, params, responseHandler, callback)`

* obj is the object that you're creating.

And the other arguments work the same as the subscription.

Drop create is slightly different, just like in the normal API:

#### `ws.drop(flowId).create(obj, params, responseHandler, callback)`

All of the drop functions behave in the same way

Then we have:

#### `ws.flow.read(id, params, responseHandler, callback)`

#### `ws.flow.update(id, obj, params, responseHandler, callback)`

#### `ws.flow.delete(id, params, responseHandler, callback)`

The arguments work generally as you would expect for each of these. Track works the same as flows.

Note: Websockets will reconnect if it loses the connection. However, it's suggested that you also enable some logic outside of the library to ensure connection as well.

If our solution is not robust enough for your purposes, we suggest looking into our Flow Agent, which you can find on the [devices page of the Developer's site](https://dev.flowthings.io/#/device/).
