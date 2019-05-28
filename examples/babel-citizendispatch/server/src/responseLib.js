"use strict";

function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify(body)
  };
}

exports.success = function (body) {
  return buildResponse(200, body);
};

exports.failure = function (body) {
  return buildResponse(500, body);
};