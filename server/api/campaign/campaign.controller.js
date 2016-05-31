'use strict';

var _ = require('lodash');
var Campaign = require('./campaign.model');
// var Code = require('../code/code.model');

// Get list of campaigns
exports.index = function(req, res) {
  Campaign.find(function (err, campaigns) {
    if(err) { return handleError(res, err); }
    return res.json(200, campaigns);
    // Campaign.populate(campaigns, {path: 'codes'}, function (err, campaigns) {
    //   if (err) return handleError(res, err);
    //   res.json(200, campaigns);
    // });
  });
};

// Get a single campaign
exports.show = function(req, res) {
  Campaign.findById(req.params.id)
    .populate('codes', 'value')
    .exec(function (err, campaign) {
      if (err) return handleError(res, err);
      res.json(201, campaign);
    });
  // Campaign.findById(req.params.id, function (err, campaign) {
  //   if (err) return handleError(res, err);
  //   res.json(campaign);
    // Campaign.populate(campaign, {path: 'codes'}, function (err, campaign) {
    //   if (err) return handleError(res, err);
    //   console.log("Tried to populate campaign " + campaign.title);
    //   console.log(campaign);
    //   res.json(campaign);
    // });
  // });
};

// Creates a new campaign in the DB.
exports.create = function(req, res) {
  Campaign.create(req.body, function(err, campaign) {
    if(err) { return handleError(res, err); }
    res.json(201, campaign);
  });
};

// Updates an existing campaign in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  if (req.body.codes && req.body.codes.length > 0 && req.body.codes[0].hasOwnProperty('value')) {
    req.body.codes = _.map(req.body.codes, function (item) { return item._id; });
  }
  Campaign.findById(req.params.id, function (err, campaign) {
    if (err) { return handleError(res, err); }
    if(!campaign) { return res.send(404); }
    var updated = _.merge(campaign, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, campaign);
    });
  });
};

// Deletes a campaign from the DB.
exports.destroy = function(req, res) {
  Campaign.findById(req.params.id, function (err, campaign) {
    if(err) { return handleError(res, err); }
    if(!campaign) { return res.send(404); }
    campaign.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}