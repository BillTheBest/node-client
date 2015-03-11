'use strict';

var WebSocket = require('ws');
var forEach = require('lodash.foreach');
var partial = require('lodash.partial');
var extend = require('lodash.assign');
var map = require('lodash.map');

var wsFactory = require('./websocketFactory.js');

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

  var flowthingsWs = new wsFactory.FlowThingsWs(url);

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
