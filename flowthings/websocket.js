'use strict';

var WebSocket = require('ws');

function BaseWs() {

}

exports.wsCb = function(err, data, cb) {
  if (err) return console.log(err);

  var opts = this.options;
  var url = opts.wsHostname;
  var sessionId = data.body.id;

  if (opts.secure) {
    url = 'wss://' + url;
  } else {
    url = 'ws://' + url;
  }

  url += sessionId + '/ws';

  return new WebSocket(url);
};
