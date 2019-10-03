
var g = require("./g");

module.exports = function id(event, context) {
  return event.body;
};