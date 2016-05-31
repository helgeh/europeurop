'use strict';

var express = require('express');
var controller = require('./code.controller');
var auth = require('../../auth/auth.service');
var captcha = require('../../components/utils/captcha');

var router = express.Router({mergeParams: true});

router.post('/:code/validate', captcha.validate(), controller.validate);

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/generate', auth.hasRole('admin'), controller.generate);
// router.get('/:id', controller.show);
router.post('/', auth.hasRole('admin'), controller.create);
// router.put('/:id', controller.update);
// router.patch('/:id', controller.update);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;