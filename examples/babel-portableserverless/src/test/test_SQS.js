'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var app = require('../adapterSQS.js');

var chai = require('chai');

var sinon = require("sinon");

var sinonChai = require("sinon-chai");

var expect = chai.expect;
chai.use(sinonChai);
describe('Tests index', function () {
  sinon.spy(console, 'log');
  it('verifies SQS correct log without a name',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    var event, context, result;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            event = {
              Records: [{
                body: ''
              }]
            };
            context = {};
            _context.next = 4;
            return app.handler(event, context);

          case 4:
            result = _context.sent;
            expect(result).to.be.an('object');
            expect(console.log).to.have.been.calledWith('{"message":"Hello World!"}');

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  })));
  it('verifies SQS correct log with a name',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2() {
    var event, context, result;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            event = {
              Records: [{
                body: 'AName'
              }]
            };
            context = {};
            _context2.next = 4;
            return app.handler(event, context);

          case 4:
            result = _context2.sent;
            expect(result).to.be.an('object');
            expect(console.log).to.have.been.calledWith('{"message":"Hello AName!"}');

          case 7:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  })));
});