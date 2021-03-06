'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

describe('GET /api/purchases', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/purchases')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});

// describe('PUT /api/purchases/:id', function() {
//   it('should lock after updated with user_id', function(done) {
//     request(app)
//       .put('/api/purchases/:id')
//       .expect(201)
//   })
// });