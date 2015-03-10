'use strict';

var WebSocket = require('ws');
var forEach = require('lodash.foreach');
var partial = require('lodash.partial');
var extend = require('lodash.assign');
var map = require('lodash.map');

var flowthingsWs = {
  baseMsgId: 0,
  responseHandlers: {},
  dropListeners: {},
  flow: {
    objectType: 'flow',
  },
  drop: {
    objectType: 'drop',
  },
  track: {
    objectType: 'track',
  }
};

var crudable = {

  create: function(obj, params, responseHandler, cb) {
    if (typeof params === 'function') {
      cb = responseHandler;
      responseHandler = params;
      params = {};
    } else if (!params) {
      params = {};
    }

    var msgId;
    if (params.msgId) {
      msgId = params.msgId;
    } else {
      msgId = flowthingsWs.baseMsgId; flowthingsWs.baseMsgId += 1;
    }

    var data = {
      msgId: msgId,
      object: this.objectType,
      type: "create",
      value: obj
    };

    if (this.objectType === "drop") {

    }

    data = JSON.stringify(data);

    if (flowthingsWs.readyState === flowthingsWs.OPEN) {
      flowthingsWs.send(data, {}, cb);
    } else {
      flowthingsWs.on('open', function open() {
        flowthingsWs.send(data, {}, cb);
      });
    }

    if (responseHandler) {
      flowthingsWs.responseHandlers[msgId] = responseHandler;
    }

  },

  read: function(id, params, responseHandler, cb) {
    if (typeof params === 'function') {
      cb = responseHandler;
      responseHandler = params;
      params = {};
    } else if (!params) {
      params = {};
    }

    var msgId;
    if (params.msgId) {
      msgId = params.msgId;
    } else {
      msgId = flowthingsWs.baseMsgId; flowthingsWs.baseMsgId += 1;
    }

    var data = {
      msgId: msgId,
      object: this.objectType,
      type: "find",
      id: id
    };

    data = JSON.stringify(data);

    if (flowthingsWs.readyState === flowthingsWs.OPEN) {
      flowthingsWs.send(data, {}, cb);
    } else {
      flowthingsWs.on('open', function open() {
        flowthingsWs.send(data, {}, cb);
      });
    }

    if (responseHandler) {
      flowthingsWs.responseHandlers[msgId] = responseHandler;
    }
  },

  update: function(id, obj, params, responseHandler, cb) {
    if (typeof params === 'function') {
      cb = responseHandler;
      responseHandler = params;
      params = {};
    } else if (!params) {
      params = {};
    }

    var msgId;
    if (params.msgId) {
      msgId = params.msgId;
    } else {
      msgId = flowthingsWs.baseMsgId; flowthingsWs.baseMsgId += 1;
    }

    var data = {
      msgId: msgId,
      object: this.objectType,
      type: "update",
      id: id,
      value: obj
    };

    data = JSON.stringify(data);

    if (flowthingsWs.readyState === flowthingsWs.OPEN) {
      flowthingsWs.send(data, {}, cb);
    } else {
      flowthingsWs.on('open', function open() {
        flowthingsWs.send(data, {}, cb);
      });
    }

    if (responseHandler) {
      flowthingsWs.responseHandlers[msgId] = responseHandler;
    }
  },

  delete: function(id, params, responseHandler, cb) {
    if (typeof params === 'function') {
      cb = responseHandler;
      responseHandler = params;
      params = {};
    } else if (!params) {
      params = {};
    }

    var msgId;
    if (params.msgId) {
      msgId = params.msgId;
    } else {
      msgId = flowthingsWs.baseMsgId; flowthingsWs.baseMsgId += 1;
    }

    var data = {
      msgId: msgId,
      object: this.objectType,
      type: "delete",
      id: id
    };

    data = JSON.stringify(data);

    if (flowthingsWs.readyState === flowthingsWs.OPEN) {
      flowthingsWs.send(data, {}, cb);
    } else {
      flowthingsWs.on('open', function open() {
        flowthingsWs.send(data, {}, cb);
      });
    }

    if (responseHandler) {
      flowthingsWs.responseHandlers[msgId] = responseHandler;
    }
  }
};

var dropCreate = {
  create: function(id, obj, params, responseHandler, cb) {
    if (typeof params === 'function') {
      cb = responseHandler;
      responseHandler = params;
      params = {};
    } else if (!params) {
      params = {};
    }

    var msgId;
    if (params.msgId) {
      msgId = params.msgId;
    } else {
      msgId = flowthingsWs.baseMsgId; flowthingsWs.baseMsgId += 1;
    }

    var data = {
      msgId: msgId,
      object: this.objectType,
      type: "create",
      flowId: id,
      value: obj
    };

    data = JSON.stringify(data);

    if (flowthingsWs.readyState === flowthingsWs.OPEN) {
      flowthingsWs.send(data, {}, cb);
    } else {
      flowthingsWs.on('open', function open() {
        flowthingsWs.send(data, {}, cb);
      });
    }

    if (responseHandler) {
      flowthingsWs.responseHandlers[msgId] = responseHandler;
    }


  },
};

var subscribable = {
  subscribe: function(id, params, dropListener, responseHandler, cb) {
    if (typeof params === 'function') {
      cb = responseHandler;
      responseHandler = dropListener;
      dropListener = params;
      params = {};
    } else if (!params) {
      params = {};
    }

    var msgId;
    if (params.msgId) {
      msgId = params.msgId;
    } else {
      msgId = flowthingsWs.baseMsgId; flowthingsWs.baseMsgId += 1;
    }

    var data = {
      msgId: msgId,
      object: 'drop',
      type: 'subscribe',
      flowId: id
    };

    data = JSON.stringify(data);

    if (flowthingsWs.readyState === flowthingsWs.OPEN) {
      flowthingsWs.send(data, {}, cb);
    } else {
      flowthingsWs.on('open', function open() {
        flowthingsWs.send(data, {}, cb);
      });
    }

    if (responseHandler) {
      flowthingsWs.responseHandlers[msgId] = responseHandler;
    }

    if (dropListener) {
      flowthingsWs.dropListeners[id] = dropListener;
    }
  },

  unsubscribe: function(id, params, responseHandler, cb) {
    if (typeof params === 'function') {
      cb = responseHandler;
      responseHandler = params;
      params = {};
    } else if (!params) {
      params = {};
    }

    var msgId;
    if (params.msgId) {
      msgId = params.msgId;
    } else {
      msgId = flowthingsWs.baseMsgId; flowthingsWs.baseMsgId += 1;
    }

    var data = {
      msgId: msgId,
      object: 'drop',
      type: 'unsubscribe',
      flowId: id
    };

    data = JSON.stringify(data);

    if (flowthingsWs.readyState === flowthingsWs.OPEN) {
      flowthingsWs.send(data, {}, cb);
    } else {
      flowthingsWs.on('open', function open() {
        flowthingsWs.send(data, {}, cb);
      });
    }

    // We delete it immediately, regardless of anything else. It'll stop listening even if the platform keeps sending for a little bit.
    delete flowthingsWs.dropListeners[id];

    if (responseHandler) {
      flowthingsWs.responseHandlers[msgId] = responseHandler;
    }

  }
};


function heartbeatMessage() {
  return JSON.stringify({
    "type": "heartbeat"
  });
}

function setHeartbeat() {
  setInterval(function() {
    //flowthingsWs.send(heartbeatMessage());
    flowthingsWs.ping(heartbeatMessage(), {}, true);
    console.log('ping');
  }, 1000);
}

function sendHeartbeat() {
  if (flowthingsWs.readyState === flowthingsWs.OPEN) {
    setHeartbeat();
  } else {
    flowthingsWs.on('open', function open() {
      setHeartbeat();
    });
  }
}

function setupListener() {
  flowthingsWs.on('message', function(data, flags) {
    var response = JSON.parse(data);
    var toDelete;
    if (response.type === "message") {
      forEach(flowthingsWs.dropListeners, function(dropListener, flowId) {
        if (response.resource === flowId) {
          dropListener(response, flags);
        }
      });
    } else {
      forEach(flowthingsWs.responseHandlers, function(responseHandler, msgId) {
        if (response.head && response.head.msgId === msgId) {
          responseHandler(response, msgId, flags);
          toDelete = msgId;
        }
      });
    }
    if (toDelete) {
      delete flowthingsWs.responseHandlers[toDelete];
    }
  });
}


exports.wsCb = function(err, data, cb) {
  if (err) return console.log(err);

  var opts = this;
  var url = opts.wsHostname;
  var sessionId = data.body.id;

  if (opts.secure) {
    url = 'wss://' + url;
  } else {
    url = 'ws://' + url;
  }

  url += '/session/' + sessionId + '/ws';

  flowthingsWs = extend(new WebSocket(url), flowthingsWs);
  flowthingsWs.flow = extend(flowthingsWs.flow, subscribable, crudable);
  flowthingsWs.drop = extend(flowthingsWs.drop, crudable, dropCreate);
  flowthingsWs.track = extend(flowthingsWs.track, crudable);

  // Heartbeat
  sendHeartbeat();

  setupListener();

  if (cb) {
    cb(flowthingsWs);
  }
};

exports.connectable = {
  connect: function(data, params, cb) {
    if (typeof data === 'function') {
      cb = data; data = null; params = null;
    } else if (typeof params === 'function') {
      cb = params; params = null;
    }

    return this.request({
      method: 'POST',
      path: '',
      data: data,
      params: params}, cb);
  }
};
