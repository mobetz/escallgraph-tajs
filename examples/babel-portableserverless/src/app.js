"use strict";

var Greetings = require('./Greetings'); // Use Express


var express = require('express');

var app = express();

function buildResponse(message) {
  var response = {
    message: message
  };
  //console.log('response: ' + JSON.stringify(response));
  return response;
}

app.get('/', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(buildResponse(Greetings.greetingsFor(req.query.name)));
});
var server = app.listen(3000, function () {
  return {}//console.log('Listening on port ' + server.address().port);
});
module.exports = app; // for testing