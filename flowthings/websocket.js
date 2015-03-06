'use strict';

var WebSocket = require('ws');
var forEach = require('lodash.foreach');
var partial = require('lodash.partial');
var extend = require('lodash.assign');
var map = require('lodash.map');

var flowthingsWs = {
  baseMsgId: 0,
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
  // Should the callback and the responseHandler be the same
  // or should they be different?

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
      flowthingsWs.on('message', function(data, flags) {
        var response = JSON.parse(data);
        if (response.head && response.head.msgId === msgId) {
          responseHandler(response, msgId, flags);
        }
      });
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
      flowthingsWs.on('message', function(data, flags) {
        var response = JSON.parse(data);
        if (response.head && response.head.msgId === msgId) {
          responseHandler(response, msgId, flags);
        }
      });
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
      flowthingsWs.on('message', function(data, flags) {
        var response = JSON.parse(data);
        if (response.head && response.head.msgId === msgId) {
          responseHandler(response, msgId, flags);
        }
      });
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
      flowthingsWs.on('message', function(data, flags) {
        var response = JSON.parse(data);
        if (response.head && response.head.msgId === msgId) {
          responseHandler(response, msgId, flags);
        }
      });
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
      flowthingsWs.on('message', function(data, flags) {
        var response = JSON.parse(data);
        if (response.head && response.head.msgId === msgId) {
          responseHandler(response, msgId, flags);
        }
      });
    }


  },
};

var subscribable = {
  subscribe: function(id, params, dropListener, cb, responseHandler) {
    if (typeof params === 'function') {
      responseHandler = cb;
      cb = dropListener;
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
      object: this.objectType,
      type: "subscribe",
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

    if (responseHandler || dropListener) {
      flowthingsWs.on('message', function(data, flags) {
        var response = JSON.parse(data);
        if (response.type === "message" && response.resource === id) {
          if (dropListener) {
            dropListener(response, flags);
          }
        }

        if (response.head && response.head.msgId === msgId) {
          if (responseHandler) {
            responseHandler(response, msgId, flags);
          }
        }
      });
    }
  }
};


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
  flowthingsWs.drop = extend(flowthingsWs.drop, subscribable, crudable);
  flowthingsWs.track = extend(flowthingsWs.track, subscribable, crudable);

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
