"use strict";

var Greetings = require('./src/Greetings'); // Event wrapper for Amazon API Gateway
var aws = require("aws-sdk");
var sqs = new aws.SQS();

exports.handler = function (event, context) {
  function buildResponse(message) {
    var params = {
      MessageBody: message,
      QueueUrl: 'arn:aws:sqs:us-east-1:XXX:GreetingsQueue'
    };
    //console.log('response: ' + JSON.stringify(response));
    sqs.sendMessage(params, function (err, data) {
      return data;
    });
  }

  //console.log('request: ' + JSON.stringify(event));
  var name;

  if (event.queryStringParameters) {
    name = event.queryStringParameters.name;
  }

  return buildResponse(Greetings.greetingsFor(name));
};

exports.handler({queryStringParameters: {name: TAJS_make('AnyStr')}});