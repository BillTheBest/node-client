'use strict';

var WebSocket = require('ws'),
    extend = require('lodash.assign'),
    forEach = require('lodash.foreach'),
    clone = require('lodash.clone'),
    size = require('lodash.size'),
    ft = require('./api'),
    EventEmitter = require('events').EventEmitter,
    inherits = require('util').inherits,
    backoff = require('backoff');

var defaults = {
  baseMsgId: 1,
  heartbeat: true,
  logHeartbeat: false,
  heartbeatInterval: 20000,
};

function FlowThingsWs(url, params, service) {
  EventEmitter.call(this);

  var self = this;

  this.url = url;
  this.options = extend({}, clone(defaults), clone(params));
  // the ws service is passed in from above,
  // so that we can easily reconnect without reconstructing the whole api
  this.service = service;

  this.baseMsgId = this.options.baseMsgId;

  this.flow = { objectType: 'flow' };
  this.track = { objectType: 'track' };
  this.drop = function(flowId) {
    var dropObject = {
      objectType: 'drop',
    };
    if (flowId) {
      dropObject.flowId = flowId;
    }

    return extend(dropObject, crudable(self), dropCreate(self));
  }

  // When ws is opened, we will subscribe to each of these.
  this.subscriptions = {};

  this._connect(url);
}

// Inherits from Event Emitter.
// almost everything will be handled from FlowThingsWs Event Emitter.
inherits(FlowThingsWs, EventEmitter);

FlowThingsWs.prototype._connect = function(url) {
  this.ws = new WebSocket(url);
  this._setupListener();
  this._startHeartbeat();
  this.ws.setMaxListeners(0);
  this._expand();
  this._reconnectionHandler();
};

FlowThingsWs.prototype._reconnect = function(cb) {
  var self = this;
  ///var api = ft.API(this.options.creds);
  self.emit('reconnecting');

  // When ws is closed, we can reconnect and nuke the old ws.
  this.service.connect({reconnect: true}, function(url, err) {
    if (err) {
      console.log('err: ', err)
      cb();
      return;
    }
    self.ws.removeAllListeners();
    self.ws.terminate();
    delete self.ws;

    self.ws = new WebSocket(url);

    self._setupListener();
    self._startHeartbeat();
    self.ws.setMaxListeners(0);
    self._resubscribe();

    self.emit('reconnect');
  });
};

FlowThingsWs.prototype._reconnectionHandler = function() {
  var self = this;

  var wsBackoff = backoff.exponential({
    randomisationFactor: 0,
    initialDelay: 1000,
    maxDelay: 100000
  });

  wsBackoff.on('ready', function(number, delay) {
    try {
      self._reconnect(function() {
        wsBackoff.backoff();
      });
    }
    catch(e) {
      console.log('e: ', e)
      wsBackoff.backoff();
    }
  });

  this.on('reconnect', function() {
    wsBackoff.reset();
  });

  this.on('close', function(code, message) {
    if (message !== 'manuallyClosing') {
      wsBackoff.backoff();
    }
  });

  this.on('error', function() {
    wsBackoff.backoff();
  });
};

FlowThingsWs.prototype._expand = function() {
  this.flow = extend(this.flow, subscribable(this), crudable(this));
  this.track = extend(this.track, crudable(this));
};

FlowThingsWs.prototype.send = function(data, options, callback) {
  if (typeof options === 'function') {
    callback = options; options = {};
  }
  var self = this;

  if (callback) {
    this.ws.send(data, options, callback);
  } else {
    this.ws.send(data, options);
  }
};

FlowThingsWs.prototype._resubscribe = function() {
  var self = this;
  // we'll run this each time it's opened.
  // the subscriptions will be set up each time.

  // if one is subscribed to while it's in the process of reconnecting,
  // we don't wanna connect to it twice.
  var subs = clone(self.subscriptions);
  var subTracker = {};

  forEach(subs, function(dropListener, flowId, collection) {
    self.flow.subscribe(flowId, dropListener, function() {
      subTracker[flowId] = flowId;
      if (size(subTracker) == size(subs)) {
        self.emit('resubscribed')
      }
    });
  });
};

FlowThingsWs.prototype._heartbeatMessage = function() {
  return JSON.stringify({
    'type': 'heartbeat'
  });
};

FlowThingsWs.prototype._setHeartbeat = function() {
  var self = this;
  this.heartbeatInterval = setInterval(function() {
    self.ws.ping(self._heartbeatMessage(), {}, true);
    if (self.logHeartbeat) {
      console.log('Flowthings WS Heartbeat');
    }
  }, self.options.heartbeatInterval);
};

FlowThingsWs.prototype._startHeartbeat = function() {
  var self = this;
  if (this.ws.readyState === this.ws.OPEN) {
    self._setHeartbeat();
  } else {
    self.ws.on('open', function open() {
      self._setHeartbeat();
    });
  }
};

FlowThingsWs.prototype.close = function() {
  this.ws.close(undefined, 'manuallyClosing');
};

FlowThingsWs.prototype._setupListener = function() {
  var self = this;

  this.ws.on('message', function(data, flags) {
    var response = JSON.parse(data);
    var toDelete;

    self.emit('message', data, flags);

    if (response.type === 'message') {
      // drop
      self.emit(response.resource, response.value, flags);
    } else if (response.head && response.head.msgId) {
      // responseHandler
      self.emit(response.head.msgId, response, response.head.msgId, flags);
    }
  });

  this.ws.on('close', function(code, message) {
    if (message === 'manuallyClosing') {
      clearInterval(this.heartbeatInterval)
    }
    self.emit('close', code, message);
  });

  this.ws.on('error', function(error) {
    self.emit('error', error);
  });

  this.ws.on('ping', function(data, flags) {
    self.emit('ping', data, flags || {});
  });

  this.ws.on('pong', function(data, flags) {
    self.emit('pong', data, flags || {});
  });

  this.ws.on('open', function() {
    self.emit('open');
  });
};

module.exports = FlowThingsWs;

// These are in the private API. We don't really want people to access them directly.

function crudable(flowthingsWs) {
  return {
    create: function(obj, params, responseHandler, cb) {
      if (typeof params === 'function') {
        cb = responseHandler; responseHandler = params; params = {};
      } else if (!params) {
        params = {};
      }

      baseWs(flowthingsWs, this.objectType, 'create', {value: obj},
             {msgId: params.msgId, responseHandler: responseHandler, cb: cb});
    },

    read: function(id, params, responseHandler, cb) {
      if (typeof params === 'function') {
        cb = responseHandler; responseHandler = params; params = {};
      } else if (!params) {
        params = {};
      }

      id = fixDropId(id, this);

      baseWs(flowthingsWs, this.objectType, 'find', {id: id},
             {msgId: params.msgId, responseHandler: responseHandler, cb: cb});
    },

    update: function(id, obj, params, responseHandler, cb) {
      if (typeof params === 'function') {
        cb = responseHandler; responseHandler = params; params = {};
      } else if (!params) {
        params = {};
      }

      id = fixDropId(id, this);

      baseWs(flowthingsWs, this.objectType, 'update', {id: id, value: obj},
             {msgId: params.msgId, responseHandler: responseHandler, cb: cb});
    },

    delete: function(id, params, responseHandler, cb) {
      if (typeof params === 'function') {
        cb = responseHandler; responseHandler = params; params = {};
      } else if (!params) {
        params = {};
      }

      id = fixDropId(id, this);

      baseWs(flowthingsWs, this.objectType, this.objectType, 'delete', {id: id},
             {msgId: params.msgId, responseHandler: responseHandler, cb: cb});
    }
  };
}

function fixDropId(id, self) {
  if (self.objectType != 'drop') {
    return id;
  }

  if (Array.isArray(id)) {
    if (id.length != 2) {
      id = [self.flowId].concat(id)
    }
  } else {
    id = [self.flowId, id];
  }

  return id;
}

function dropCreate(flowthingsWs) {
  return {
    create: function(obj, params, responseHandler, cb) {
      if (typeof params === 'function') {
        cb = responseHandler; responseHandler = params; params = {};
      } else if (!params) {
        params = {};
      }

      baseWs(flowthingsWs, this.objectType, 'create',
             {flowId: this.flowId, value: obj},
             {msgId: params.msgId, responseHandler: responseHandler, cb: cb});
    },
  };
}

function subscribable(flowthingsWs) {
  return {
    subscribe: function(id, params, dropListener, responseHandler, cb) {
      if (typeof params === 'function') {
        cb = responseHandler; responseHandler = dropListener;
        dropListener = params; params = {};
      } else if (!params) {
        params = {};
      }

      if (dropListener) {
        flowthingsWs.on(id, dropListener);
      }

      flowthingsWs.subscriptions[id] = dropListener;

      baseWs(flowthingsWs, 'drop', 'subscribe', {flowId: id},
             {msgId: params.msgId, responseHandler: responseHandler, cb: cb});
    },

    unsubscribe: function(id, params, responseHandler, cb) {
      if (typeof params === 'function') {
        cb = responseHandler; responseHandler = params; params = {};
      } else if (!params) {
        params = {};
      }

      // We delete it immediately, regardless of anything else.
      // It'll stop listening even if the platform keeps sending for a little bit.
      flowthingsWs.removeAllListeners(id);
      delete flowthingsWs.subscriptions[id];

      baseWs(flowthingsWs, 'drop', 'unsubscribe', {flowId: id},
             {msgId: params.msgId, responseHandler: responseHandler, cb: cb});
    }
  };
}

function baseWs(flowthingsWs, object, type, values, params) {

  var msgId;
  if (params.msgId) {
    msgId = params.msgId;
  } else {
    msgId = flowthingsWs.baseMsgId; flowthingsWs.baseMsgId += 1;
  }

  if (params.responseHandler) {
    flowthingsWs.once(msgId.toString(), params.responseHandler);
  }

  var data = { msgId: msgId, object: object, type: type };

  if (values.flowId) data.flowId = values.flowId;

  if (values.id) data.id = values.id;

  if (values.value) data.value = values.value;

  data = JSON.stringify(data);

  if (flowthingsWs.ws.readyState === flowthingsWs.ws.OPEN) {
    flowthingsWs.send(data, {}, params.cb);
  } else {
    flowthingsWs.once('open', function open() {
      flowthingsWs.send(data, {}, params.cb);
    });
  }
}
