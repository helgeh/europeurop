'use strict';

var _ = require('lodash');
var Purchase = require('./purchase.model');
var Campaign = require('../campaign/campaign.model');
var User = require('../user/user.model');

// Get list of purchases
exports.index = function(req, res) {
  Purchase.find(function (err, purchases) {
    if(err) { return handleError(res, err); }
    return res.json(200, purchases);
  });
};

// Get a single purchase
exports.show = function(req, res) {
  Purchase.findById(req.params.id, function (err, purchase) {
    if(err) { return handleError(res, err); }
    if(!purchase) { return res.send(404); }
    return res.json(purchase);
  });
};

// Creates a new purchase in the DB.
exports.create = function(req, res) {
  // var requiredMsg = 'Prerequisite not found. Cannot create purchase without campaign and user set.';
  
  // Campaign.findById(req.query.campaign_id, function (err, campaign) {
  //   if (err) return handleError(res, err);
  //   if (!campaign) return handleError(res, requiredMsg);
  //   User.findById(req.query.user_id, function (err, user) {
  //     if (err) return handleError(res, err);
  //     if (!user) return handleError(res, requiredMsg);
  //     Purchase.create(req.query, function (err, purchase) {
  //       if (err) return handleError(res, err);
  //       return res.json(201, purchase);
  //     })
  //   });
  // });
};

// Updates an existing purchase in the DB.
exports.update = function(req, res) {
  if (!req.user || !req.user.role)
    return res.send(401);
  Purchase.findById(req.params.id, function (err, purchase) {
    if(err) return handleError(res, err);
    if(!purchase) return res.send(404);
    if(purchase.active) return res.send(401);// <-- when purchase has been saved with user_id it should never be updated again
    if(req.user._id != req.body.user_id) return res.send(400);
    if(req.body._id) delete req.body._id;
    req.body.active = true;
    var updated = _.merge(purchase, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, updated);
    });
  });
};

// Deletes a purchase from the DB.
exports.destroy = function(req, res) {
  Purchase.findById(req.params.id, function (err, purchase) {
    if(err) { return handleError(res, err); }
    if(!purchase) { return res.send(404); }
    purchase.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
