'use strict';

var extend = require('lodash.assign');

exports.findable = {
  read: function(id, params, cb) {
    if (typeof params === 'function') {
      cb = params; params = null;
    }
    return this.request({ method: 'GET', path: '/' + id, params: params }, cb);
  },
  readMany: function(ids, params, cb) {
    if (typeof params === 'function') {
      cb = params; params = null;
    }
    return this.request({ method: 'MGET', path: '', data: ids, params: params }, cb);
  },
  findMany: function(params, cb) {
    if (typeof params === 'function') {
      cb = params; params = {};
    } else {
      params = params || {};
    }
    return this.request({ method: 'GET', path: '', params: params }, cb);
  },
  find: function(fst, snd, cb) {
    if (typeof fst === 'string') {
      return this.read(fst, snd, cb);
    } else if (Array.isArray(fst)) {
      return this.readMany(fst, snd, cb);
    } else {
      return this.findMany(fst, snd);
    }
  }
};

exports.creatable = {
  create: function(data, params, cb) {
    if (typeof data === 'function') {
      cb = data; data = null; params = null;
    } else if (typeof params === 'function') {
      cb = params; params = null;
    }
    return this.request({ method: 'POST', path: '', data: data, params: params }, cb);
  }
};

exports.updatable = {
  update: function(data, params, cb) {
    if (typeof params === 'function') {
      cb = params; params = null;
    }
    return this.request({ method: 'PUT', path: '/' + data.id, data: data, params: params }, cb);
  },
  updateMany: function(data, params, cb) {
    if (typeof params === 'function') {
      cb = params; params = null;
    }
    data = data.reduce(function(acc, d) {
      acc[d.id] = d;
      return acc;
    }, {});
    return this.request({ method: 'MPUT', path: '', data: data, params: params }, cb);
  },
  save: function(data, params, cb) {
    if (Array.isArray(data)) {
      return this.updateMany(data, params, cb);
    } else {
      return this[data.id ? 'update' : 'create'](data, params, cb);
    }
  }
};

exports.deletable = {
  delete: function(id, params, data, cb) {
    if (typeof params === 'function') {
      cb = params; data = null; params = null;
    } else if (typeof data === 'function') {
      cb = data; data = null;
    }
    if (typeof id === 'object') {
      id = id.id;
    }
    return this.request({ method: 'DELETE', path: '/' + id, data: data, params: params }, cb);
  }
};

exports.aggregatable = {
  aggregate: function(data, params, cb) {
    if (typeof params === 'function') {
      cb = params; params = null;
    }

    return this.request({ method: 'POST', path: '/aggregate', data: data, params: params }, cb);
  }
}

exports.crudable = extend({}, exports.findable,
                              exports.creatable,
                              exports.updatable,
                              exports.deletable);
