'use strict';

var WebSocket = require('ws');
var extend = require('lodash.assign');


exports.FlowThingsWs = function(url, params) {

  var flowthingsWs = {
    baseMsgId: 1,
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

      if (responseHandler) {
        flowthingsWs.once(msgId.toString(), responseHandler);
      }

      var data = {
        msgId: msgId,
        object: this.objectType,
        type: "create",
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

      if (responseHandler) {
        flowthingsWs.once(msgId.toString(), responseHandler);
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

      if (responseHandler) {
        flowthingsWs.once(msgId.toString(), responseHandler);
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

      if (responseHandler) {
        flowthingsWs.once(msgId.toString(), responseHandler);
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

      if (responseHandler) {
        flowthingsWs.once(msgId.toString(), responseHandler);
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

      if (responseHandler) {
        flowthingsWs.once(msgId.toString(), responseHandler);
      }

      if (dropListener) {
        flowthingsWs.on(id, dropListener);
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

      if (responseHandler) {
        flowthingsWs.once(msgId.toString(), responseHandler);
      }

      // We delete it immediately, regardless of anything else. It'll stop listening even if the platform keeps sending for a little bit.
      flowthingsWs.removeAllListeners(id);

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
    }
  };


  flowthingsWs._heartbeatMessage = function() {
    return JSON.stringify({
      "type": "heartbeat"
    });
  };

  flowthingsWs._setHeartbeat = function() {
    setInterval(function() {
      flowthingsWs.ping(flowthingsWs._heartbeatMessage(), {}, true);
      console.log('Heartbeat');
    }, 20000);
  };

  flowthingsWs._startHeartbeat = function() {
    if (flowthingsWs.readyState === flowthingsWs.OPEN) {
      flowthingsWs._setHeartbeat();
    } else {
      flowthingsWs.on('open', function open() {
        flowthingsWs._setHeartbeat();
      });
    }
  };

  flowthingsWs._setupListener = function() {
    flowthingsWs.on('message', function(data, flags) {
      var response = JSON.parse(data);
      var toDelete;

      if (response.type === "message") {
        flowthingsWs.emit(response.resource, response, flags);
      } else if (response.head && response.head.msgId) {
        flowthingsWs.emit(response.head.msgId, response,
                          response.head.msgId, flags);
      }
    });
  };

  flowthingsWs = extend(new WebSocket(url), flowthingsWs);
  flowthingsWs.flow = extend(flowthingsWs.flow, subscribable, crudable);
  flowthingsWs.drop = extend(flowthingsWs.drop, crudable, dropCreate);
  flowthingsWs.track = extend(flowthingsWs.track, crudable);

  flowthingsWs.setMaxListeners(0);

  flowthingsWs._startHeartbeat();
  flowthingsWs._setupListener();


  return flowthingsWs;
};
