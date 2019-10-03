
var b = require("./b");

module.exports = function id(event, context) {
  return event.body;
};