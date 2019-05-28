"use strict";

var generateId = function generateId() {
  var bytes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
  return require('crypto').randomBytes(bytes).toString('hex');
};

module.exports = generateId;