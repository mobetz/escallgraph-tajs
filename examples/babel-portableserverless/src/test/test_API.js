'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var app = require('../adapterAPI.js');

var chai = require('chai');

var expect = chai.expect;
describe('Tests index', function () {
  it('verifies API correct response without a name',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    var event, context, result, response;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            event = {};
            context = {};
            _context.next = 4;
            return app.handler(event, context);

          case 4:
            result = _context.sent;
            expect(result).to.be.an('object');
            expect(result.statusCode).to.equal(200);
            expect(result.body).to.be.a('string');
            response = JSON.parse(result.body);
            expect(response).to.be.an('object');
            expect(response.message).to.be.a('string');
            expect(response.message).to.equal('Hello World!');

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  })));
  it('verifies API correct response with a name',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2() {
    var event, context, result, response;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            event = {
              queryStringParameters: {
                name: "AName"
              }
            };
            context = {};
            _context2.next = 4;
            return app.handler(event, context);

          case 4:
            result = _context2.sent;
            expect(result).to.be.an('object');
            expect(result.statusCode).to.equal(200);
            expect(result.body).to.be.a('string');
            response = JSON.parse(result.body);
            expect(response).to.be.an('object');
            expect(response.message).to.be.a('string');
            expect(response.message).to.equal('Hello AName!');

          case 12:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  })));
});