'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../../auth/auth.service');
var config = require('../../config/environment');

var router = express.Router();

router.get('/menu', function(req, res, next) {
  var env = express().get('env');
  if (env == 'development') {
    res.json({menu: [
      { label: 'Admin',   link: '/admin' },
      { label: 'Settings',   link: '/settings' },
      { label: 'Login', link: '/login'},
      { label: 'Signup', link: '/signup'}
    ]});
  }
  else
    res.send(401);
});

router.get('/seed_db', function(req, res, next) {
  if (auth.hasRole('superadmin')) {
    require('../../config/seed');
    res.send(200);
  }
  else
    res.send(401);
});

module.exports = router;