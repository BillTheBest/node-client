'use strict';

var extend = require('lodash.assign');
var util = require('./util');
var WebSocket = require('ws');
var wsUtil = require('./websocket.js');
var clone = require('lodash.clone');

function BaseService(path, opts, ws) {
  this.path = path;
  this.options = opts;

  // for websockets, we don't want to mutate the opts argument,
  // but we do need to pass in the ws to the opts argument.
  // so we create a new opts object!
  if (ws) {
    this.ws = true;
    this.options = extend({}, opts);
    this.options.ws = true;
  }
}

BaseService.prototype._mkPath = function(req) {
  if (this.options.ws == true) return this.path;

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

  if (opts.ws) {
    opts.hostname = opts.wsHostname;
  }

  var self = this;

  return opts.request({
    creds: opts.creds,
    secure: opts.secure,
    hostname: opts.hostname,
    method: req.method || 'GET',
    path: this._mkPath(req),
    data: this._mkData(req),
    params: params,
    userAgent: opts.userAgent,
  }, function(err, status, headers, data) {

    if (opts.ws) {
      if (params.reconnect) {
        opts = extend(opts, {reconnect: true});
      }

      if (!err) {
        data = opts.encoder.parse(data);
        wsUtil.wsCb(null, data, cb, opts, self);
      } else {
        wsUtil.wsCb(err, null, cb, opts, self);
      }
    } else if (cb) {
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
  if (this.ws) {
    return this._mkRequest(req, cb);
  } else {
    return this.options.transform
      ? this.options.transform(this.options, this._mkRequest.bind(this), req, cb)
      : this._mkRequest(req, cb);
  }
};

exports.service = function(path, mixins, opts) {
  return extend.apply(null, [new BaseService(path, opts)].concat(mixins));
};

exports.serviceFactory = function(path, mixins, opts) {
  return function(context) {
    return exports.service(path + '/' + context, mixins, opts);
  };
};

exports.webSocketService = function(path, mixins, opts) {
  return extend.apply(null, [new BaseService(path, opts, true)].concat(mixins));
};
