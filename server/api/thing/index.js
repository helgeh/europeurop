'use strict';

var express = require('express');
var controller = require('./thing.controller');
var auth = require('../../auth/auth.service');

var router = express.Router({mergeParams: true});

router.get('/', controller.index);
router.get('/:id', auth.hasRole('admin'), controller.show);

router.post('/', auth.hasRole('admin'), controller.create);
// router.put('/:id', controller.update);
// router.patch('/:id', controller.update);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

router.get('/:id/files/:file', auth.isAuthenticated(), controller.download);

module.exports = router;