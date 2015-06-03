'use strict';

var express = require('express');
var aws = require('./aws');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/config', aws.getClientConfig);
router.get('/s3Policy/:file/write', auth.hasRole('admin'), aws.getS3WritePolicy);
// router.get('/s3Policy/:file/read', auth.isAuthenticated(), aws.getS3ReadPolicy);

  // app.get('/api/config', aws.getClientConfig);
  // app.get('/api/s3Policy', aws.getS3Policy);

module.exports = router;