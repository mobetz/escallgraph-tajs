
var f = require("./f");

module.exports = function id(event, context) {
  return event.body;
};