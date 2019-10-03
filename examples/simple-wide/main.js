

var a = require("./a");
var b = require("./b");
var c = require("./c");

module.exports = function id(event, context) {
  return event.body;
};