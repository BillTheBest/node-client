'use strict';

var clone = require('lodash.clone');
var forEach = require('lodash.foreach');
var isString = require('lodash.isString');
var isRegExp = require('lodash.isRegExp');
var err = require('./errors');

exports.mkHeaders = function(opts) {
  return {
    'Accept': '*/*',
    'Content-Type': 'application/json; charset="UTF-8"',
    'X-Auth-Account': opts.creds.account,
    'X-Auth-Token': opts.creds.token
  };
};

exports.mkError = function(creds, errors, status) {
  switch (status) {
    case 400: return new err.FlowThingsBadRequest(creds, errors);
    case 403: return new err.FlowThingsForbidden(creds, errors);
    case 404: return new err.FlowThingsNotFound(creds, errors);
    case 500: return new err.FlowThingsServerError(creds, errors);
    default:  return new err.FlowThingsError(creds, errors, status);
  }
};

exports.mkParams = function(spec) {
  var p = clone(spec);

  if (p.only && Array.isArray(p.only)) {
    p.only = p.only.join(',');
  }

  if (p.refs) {
    p.refs = 1;
  }

  if (p.filter && !isString(p.filter)) {
    p.filter = mkFilter(p.filter);
  }

  return p;
};

function mkFilter(spec) {
  var f = [];

  forEach(spec, function(v, k) {
    if (k === '$and') {
      f.push([v.map(mkFilter).join('&&')]);
    } else if (k === '$or') {
      f.push([v.map(mkFilter).join('||')]);
    } else if (isRegExp(v)) {
      f.push([k, '=~', mkRegExp(v)]);
    } else if (v.hasOwnProperty('$regex')) {
      f.push([k, '=~', mkEscapedRegExp(v.$regex)]);
    } else if (v.hasOwnProperty('$lt')) {
      f.push([k, '<', JSON.stringify(v.$lt)]);
    } else if (v.hasOwnProperty('$gt')) {
      f.push([k, '>', JSON.stringify(v.$gt)]);
    } else if (v.hasOwnProperty('$lte')) {
      f.push([k, '<=', JSON.stringify(v.$lte)]);
    } else if (v.hasOwnProperty('$gte')) {
      f.push([k, '>=', JSON.stringify(v.$gte)]);
    } else {
      f.push([k, '==', JSON.stringify(v)]);
    }
  });

  return f.map(function(a) {
    return '(' + a.join(' ') + ')';
  }).join('&&');
}

function mkRegExp(reg) {
  var str = reg.source;
  var flags = '';

  if (reg.global) {
    flags += 'g';
  }
  if (reg.ignoreCase) {
    flags += 'i';
  }
  if (reg.multiline) {
    flags += 'm';
  }

  return '/' + str + '/' + flags;
}

function mkEscapedRegExp(reg) {
  var str, flags;

  if (Array.isArray(reg)) {
    str = reg[0];
    flags = reg[1] || '';
  } else {
    str = reg;
    flags = '';
  }

  return '/' + str.replace(/\//g, '\\/') + '/' + flags;
}
