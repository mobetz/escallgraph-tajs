
var h = require("./h");

module.exports = function id(event, context) {
  return event.body;
};