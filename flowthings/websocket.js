'use strict';

var WebSocket = require('ws'),
    forEach = require('lodash.foreach'),
    partial = require('lodash.partial'),
    extend = require('lodash.assign'),
    map = require('lodash.map'),
    FlowThingsWs = require('./websocketFactory');

exports.wsCb = function(err, data, cb, opts, that) {
  if (err) return console.log(err);

  if (data.head.ok == 'false' || data.head.ok == false) {
    forEach(data.head.errors, function(err) {
      console.log(err);
    });
    return;
  }

  var opts = this;
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
    var flowthingsWs = new FlowThingsWs(url, opts);

    if (cb) cb(flowthingsWs);
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
