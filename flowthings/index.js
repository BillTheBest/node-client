'use strict';

var api = require('./api');
var err = require('./errors');

module.exports = {
  API: api.API,
  defaults: api.defaults,
  promisify: api.promisify,
  FlowThingsError: err.FlowThingsError,
  FlowThingsBadRequest: err.FlowThingsBadRequest,
  FlowThingsForbidden: err.FlowThingsForbidden,
  FlowThingsNotFound: err.FlowThingsNotFound,
  FlowThingsServerError: err.FlowThingsServerError
};
