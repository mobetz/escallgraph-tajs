"use strict";

var chai = require('chai');

var chaiHttp = require('chai-http');

var expect = chai.expect;

var app = require('../app');

chai.use(chaiHttp);
it('verifies app correct response without a name', function (done) {
  chai.request(app).get('/').end(function (err, res) {
    expect(res.body.message).to.be.equal("Hello World!");
    done();
  });
});
it('verifies app correct response with a name', function (done) {
  chai.request(app).get('/?name=AName').end(function (err, res) {
    expect(res.body.message).to.be.equal("Hello AName!");
    done();
  });
});