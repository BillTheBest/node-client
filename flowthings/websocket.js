'use strict';

var WebSocket = require('ws');

function BaseWs() {

}

exports.mkWsCb = function() {
  return function(err, data, cb) {
    if (err) return console.log(err);

    var opts = this.options;
    var baseUrl = 'wss://ws.flowthings.io/session/';
    var sessionId = data.body.id;
    var url = "";

    this.opts = this.options;

    if (opts.polling) {
      url = baseUrl + sessionId + '/polling';
    } else if (opts.streaming) {
      url = baseUrl + sessionId + '/streaming';
    } else {
      url = baseUrl + sessionId + '/ws';
    }

    return new WebSocket(url);
  };
};
