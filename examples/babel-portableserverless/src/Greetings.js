"use strict"; // Your Business Logic

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var greeting = 'Good Morning';
var defaultName = 'from AWS Lambda and Amazon SQS';

var Greetings =
/*#__PURE__*/
function () {
  function Greetings() {
    _classCallCheck(this, Greetings);
  }

  _createClass(Greetings, null, [{
    key: "greetingsFor",
    value: function greetingsFor(name) {
      //console.log('name: ', name);

      if (name === undefined || name === null || name == '') {
        name = defaultName || 'World';
      }

      var greetings = (greeting || 'Hello') + ' ' + name + '!';
      //console.log('greetings: ', greetings);
      return greetings;
    }
  }]);

  return Greetings;
}();

module.exports = Greetings;