'use strict';

var http = require('http');
var https = require('https');
var forEach = require('lodash.foreach');
var partial = require('lodash.partial');
var extend = require('lodash.assign');
var map = require('lodash.map');
var base = require('./base');
var mixins = require('./mixins');
var util = require('./util');
var wsUtils = require('./websocket.js');
var libraryVersion = require('../package.json').version

function API(creds, opts) {
  if (!(this instanceof API)) {
    return new API(creds, opts);
  }

  this.options = extend({}, defaults, opts, { creds: creds });

  forEach(this.options.services, function(v, k) {
    this[k] = v(this.options);
  }, this);
}

var defaults = {
  params: {},
  request: apiRequest,
  secure: true,
  hostname: 'api.flowthings.io',
  wsHostname: 'ws.flowthings.io',
  version: '0.1',
  encoder: JSON,
  userAgent: "Flowthings Node Client " + libraryVersion,
  services: {
    root: partial(base.service, '', []),
    flow: partial(base.service, '/flow', [mixins.crudable]),
    drop: partial(base.serviceFactory, '/drop', [mixins.crudable, mixins.aggregatable]),
    track: partial(base.service, '/track', [mixins.crudable]),
    group: partial(base.service, '/group', [mixins.crudable]),
    apiTask: partial(base.service, '/api-task', [mixins.crudable]),
    mqtt: partial(base.service, '/mqtt', [mixins.crudable]),
    rss: partial(base.service, '/rss', [mixins.crudable]),
    device: partial(base.service, '/device', [mixins.crudable]),
    identity: partial(base.service, '/identity', [mixins.findable]),
    share: partial(base.service, '/share', [mixins.findable, mixins.creatable, mixins.deletable]),
    token: partial(base.service, '/token', [mixins.findable, mixins.creatable, mixins.deletable]),
    webSocket: partial(base.webSocketService, '/session', [wsUtils.connectable]),
  },
};

function apiRequest(opts, callback) {
  var query = map(opts.params, function(v, k) {
    return k + '=' + encodeURIComponent(v.toString());
  }).join('&');

  var req = (opts.secure ? https : http).request({
    hostname: opts.hostname,
    method: opts.method,
    path: opts.path + (query ? '?' + query : ''),
    headers: util.mkHeaders(opts)
  }, receive);

  req.on('error', callback);

  if (opts.data != null) {
    req.write(opts.data);
  }
  req.end();

  function receive(res) {
    var data = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      data += chunk;
    });
    res.on('end', function() {
      callback(null, res.statusCode, res.headers, data);
    });
  }
}

function promisify(P) {
  return function(opts, request, req) {
    return new P(function(resolve, reject) {
      request(req, function(err, resp) {
        if (err) {
          reject(err);
        } else {
          resolve(resp);
        }
      });
    });
  };
}

exports.API = API;
exports.defaults = defaults;
exports.promisify = promisify;
