'use strict';

var graphql = require('graphql');

var schema = require('../src/schema');

exports.handler = function (event, context, callback) {
  var body = JSON.parse(event.body);
  return graphql(schema, body.query, null, null, body.variables).then(function (result) {
    return callback(null, {
      statusCode: 200,
      body: JSON.stringify(result),
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  }, function (err) {
    console.log(err), callback(err);
  });
};