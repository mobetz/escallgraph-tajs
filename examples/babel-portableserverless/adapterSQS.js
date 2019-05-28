"use strict";

var Greetings = require('./src/Greetings'); // Event wrapper for Amazon SQS


exports.handler = function (event, context) {
  function buildResponse(message) {
    var response = {
      message: message
    };
    //console.log(JSON.stringify(response));
  }

  //console.log('event: ' + JSON.stringify(event));
  var records = event.Records;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = records[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var record = _step.value;
      var name = record.body;
      buildResponse(Greetings.greetingsFor(name));
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return {};
};