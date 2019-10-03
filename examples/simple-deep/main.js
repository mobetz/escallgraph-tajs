

var a = require("./a");

module.exports = function id(event, context) {
  return event.body;
};