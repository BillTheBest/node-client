'use strict';

var extend = require('lodash.assign');
var util = require('./util');
var WebSocket = require('ws');
var wsUtil = require('./websocket.js');

function BaseService(path, opts) {
  this.path = path;
  this.options = opts;
}

BaseService.prototype._mkPath = function(req) {
  return '/v' + this.options.version
       + '/' + this.options.creds.account
       + this.path
       + (req.path || '');
};

BaseService.prototype._mkData = function(req) {
  return req.data == null ? null : this.options.encoder.stringify(req.data);
};

BaseService.prototype._mkParams = function(req) {
  return extend({}, this.params, req.params && util.mkParams(req.params));
};

BaseService.prototype._mkRequest = function(req, cb) {
  var params = this._mkParams(req);
  var opts = this.options;

  return opts.request({
    creds: opts.creds,
    secure: opts.secure,
    hostname: opts.hostname,
    method: req.method || 'GET',
    path: this._mkPath(req),
    data: this._mkData(req),
    params: params
  }, function(err, status, headers, data) {
    if (opts.wsCb) {
      if (!err) {
        opts.wsCb(null, data);
      }
    }

    if (cb) {
      if (err) {
        cb(err);
      } else {
        data = opts.encoder.parse(data);
        if (status >= 400) {
          cb(util.mkError(opts.creds, data.head.errors, status));
        } else if (params.refs) {
          cb(null, [data.body, data.head.references]);
        } else {
          cb(null, data.body);
        }
      }
    }
  });
};

BaseService.prototype.request = function(req, cb) {
  return this.options.transform
    ? this.options.transform(this.options, this._mkRequest.bind(this), req, cb)
    : this._mkRequest(req, cb);
};

exports.service = function(path, mixins, opts) {
  return extend.apply(null, [new BaseService(path, opts)].concat(mixins));
};

exports.serviceFactory = function(path, mixins, opts) {
  return function(context) {
    return exports.service(path + '/' + context, mixins, opts);
  };
};

exports.webSocketService = function(path, opts) {
  opts.hostname = 'ws.flowthings.io';
  opts.secure = true;
  opts.path = "/session";

  opts.wsCb = wsUtil.mkWsCb();

  return extend.apply(null, [new BaseService(path, opts)].concat(mixins));
};
