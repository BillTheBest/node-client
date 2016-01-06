'use strict';

var WebSocket = require('ws');
var forEach = require('lodash.foreach');
var partial = require('lodash.partial');
var extend = require('lodash.assign');
var map = require('lodash.map');
var FlowThingsWs = require('./websocketFactory');

exports.wsCb = function(err, data, cb, opts, service) {
  if (err) {
    cb(null, err);
    return;
  }

  if (data.head.ok == 'false' || data.head.ok == false) {
    forEach(data.head.errors, function(err) {
      console.log(err);
    });
    return;
  }

  var url = opts.wsHostname;
  var sessionId = data.body.id;
  var reconnectInterval =  1000 * 60;

  if (opts.secure) {
    url = 'wss://' + url;
  } else {
    url = 'ws://' + url;
  }
  url += '/session/' + sessionId + '/ws';

  if (opts.reconnect) {
    cb(url);
  } else {
    var flowthingsWs = new FlowThingsWs(url, opts, service);
    if (cb) {
      cb.call(flowthingsWs, flowthingsWs);
    }
  }
};

exports.connectable = {
  connect: function(params, cb) {
    if (typeof params === 'function') {
      cb = params; params = null;
    }

    return this.request({
      method: 'POST',
      path: '',
      params: params}, cb);
  }
};
