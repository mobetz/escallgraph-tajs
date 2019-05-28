'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var app = require('../Greetings.js');

var chai = require('chai');

var expect = chai.expect;
describe('Tests index', function () {
  it('verifies Greetings correct response without a name',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    var result;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            result = app.greetingsFor();
            expect(result).to.be.a('string');
            expect(result).to.equal('Hello World!');

          case 3:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  })));
  it('verifies Greetings correct response with an empty name',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2() {
    var name, result;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            name = '';
            result = app.greetingsFor(name);
            expect(result).to.be.a('string');
            expect(result).to.equal('Hello World!');

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  })));
  it('verifies Greetings correct response with a name',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3() {
    var name, result;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            name = 'AName';
            result = app.greetingsFor(name);
            expect(result).to.be.a('string');
            expect(result).to.equal('Hello AName!');

          case 4:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  })));
});