'use strict';

var util = require('util');

function FlowThingsError(creds, errors, status) {
  this.name = 'FlowThingsError';
  this.message = 'An error occured when processing your request';
  this.stack = new Error().stack;
  this.creds = creds;
  this.errors = errors;
  this.status = status;
}

function FlowThingsBadRequest(creds, errors) {
  FlowThingsError.call(this, creds, errors, 400);
}

function FlowThingsForbidden(creds, errors) {
  FlowThingsError.call(this, creds, errors, 403);
}

function FlowThingsNotFound(creds, errors) {
  FlowThingsError.call(this, creds, errors, 404);
}

function FlowThingsServerError(creds, errors) {
  FlowThingsError.call(this, creds, errors, 500);
}

util.inherits(FlowThingsError, Error);
util.inherits(FlowThingsBadRequest, FlowThingsError);
util.inherits(FlowThingsForbidden, FlowThingsError);
util.inherits(FlowThingsNotFound, FlowThingsError);
util.inherits(FlowThingsServerError, FlowThingsError);

exports.FlowThingsError = FlowThingsError;
exports.FlowThingsBadRequest = FlowThingsBadRequest;
exports.FlowThingsForbidden = FlowThingsForbidden;
exports.FlowThingsNotFound = FlowThingsNotFound;
exports.FlowThingsServerError = FlowThingsServerError;
