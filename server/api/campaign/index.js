'use strict';

var express = require('express');
var controller = require('./campaign.controller');
var codeController = require('../code/code.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.use('/:campaign_id/things', require('../thing'));
router.use('/:campaign_id/codes', require('../code'));


/// TODO prevent brute-force
router.use('/validate/:code', codeController.validate);

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/:id', auth.hasRole('admin'), controller.show);
router.post('/', auth.hasRole('admin'), controller.create);
router.put('/:id', auth.hasRole('admin'), controller.update);
router.post('/:id', auth.hasRole('admin'), controller.update);
router.patch('/:id', auth.hasRole('admin'), controller.update);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;