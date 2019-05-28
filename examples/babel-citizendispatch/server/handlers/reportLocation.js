'use strict';

var dynamoDbLib = require('../src/dynamoDbLib');

var _require = require('../src/responseLib'),
    success = _require.success,
    failure = _require.failure;

exports.handler = function (event, context, callback) {
  var id;
  var body = JSON.parse(event.body);

  try {
    if (event.isOffline) {
      id = body.id;
    } else {
      id = event.requestContext.authorizer.claims['cognito:username'];
    }

    console.log('Received request from user:', id);
  } catch (e) {
    console.log("reportLocation could not determine caller username: ", e);
  } // Number of seconds the record should be left in DDB table


  var millisecondsTtl = 86400000;
  var params = {
    TableName: "citizen-dispatch-dev-userLocations",
    Item: {
      id: id,
      timestamp: Date.now(),
      latitude: body.latitude,
      longitude: body.longitude,
      expiresAt: Date.now() + millisecondsTtl
    }
  };

  try {
    dynamoDbLib.put(params);
    callback(null, success(params.Item));
  } catch (e) {
    console.log("Error in DDB Put:", e);
    callback(null, failure({
      status: false
    }));
  }
};