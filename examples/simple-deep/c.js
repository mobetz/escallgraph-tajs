
var d = require("./d");

module.exports = function id(event, context) {
  return event.body;
};