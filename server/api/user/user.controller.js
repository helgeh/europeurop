'use strict';

var User = require('./user.model');
var Purchase = require('../purchase/purchase.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var auth = require('../../auth/auth.service');

var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.send(500, err);
    res.json(200, users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    res.json({token: auth.signToken(user._id, user.role)});
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    res.json(user.profile);
  });
};

/**
 * Get list of purchases owned by user
 */
exports.getPurchases = function(req, res) {
  var userId = req.user._id, query;
  if (req.user.role === 'admin') {
    query = Purchase.find();
    query.populate('campaign');
  }
  else {
    query = Purchase.find({user_id: userId});
    query.populate('campaign', '-codes');// <-- don't show codes to anyone other than admins
  }
  query.exec(function (err, purchases) {
    if(err) return res.send(500, err);
    // console.log(purchases);
    if (!purchases || purchases.length < 1) return res.send(404);
    res.json(200, purchases);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.send(500, err);
    return res.send(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id, query;
  query = User.findOne({_id: userId});
  query.select('-salt -hashedPassword'); // don't ever give out the password or salt
  query.exec(function(err, user) {
    if (err) return next(err);
    if (!user) return res.json(401);
    Purchase.find({user_id: user._id}, function (err, purchases) {
      if (purchases && purchases.length > 0) {
        user.purchases = purchases;
      }
      res.json(user);
    });
  });
};

// exports.validateEmail = function(req, res, next) {

// }

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
