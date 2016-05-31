/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Thing = require('./thing.model');
var Campaign = require('../campaign/campaign.model');
var Purchase = require('../purchase/purchase.model');
var User = require('../user/user.model');
var aws = require('../../components/aws/aws');

// Download associated files
exports.download = function (req, res) {
  if ( ! (req.params.campaign_id && req.user._id))
    return handleError(res, {message: "Required parameters missing."});
  var query = {
      campaign : req.params.campaign_id, 
      user_id  : req.user._id
    }, 
    isAdmin = !!(req.user.role === 'admin');

  if (isAdmin) {
    Campaign.findById(query.campaign).exec(function (err, campaign) {
      if (err) return handleError(res, err);
      if (!campaign) return res.send(404);
      getTheThing(campaign);
    })
  }
  else {
    Purchase.findOne(query).populate('campaign').exec(function (err, purchase) {
      if (err) return handleError(res, err);
      if (!purchase || !purchase.active || !purchase.campaign) return res.send(403);
      getTheThing(purchase.campaign);
    });
  }
  function getTheThing(campaign) {
    Thing.findById(req.params.id, function (err, thing) {
      if(err) { return handleError(res, err); }
      if(!thing) { return res.send(404); }
      req.params.file = campaign.slug + '/' + thing.name;
      aws.getS3ReadPolicy(req, res);
    });
  }
}

exports.index = function(req, res) {
  var query, where, select, isAdmin = !!(req.user.role === 'admin');
  if (!req.params.hasOwnProperty('campaign_id')) return res.send(404);
  where = {_id: req.params.campaign_id};
  query = Campaign.findOne(where);
  query.exec(function (err, campaign) {
    if (err) return handleError(res, err);
    select = '_id name info';
    if (isAdmin)
      select += ' url s3Object';
    query = Thing.find({'_id': { $in: campaign.things}});
    query.select(select);
    query.exec(function(err, docs) {
      if (err) return handleError(res, err);
      return res.json(200, docs); // .map(function(item){return item.toObject({virtuals:true});}));
    });
  });
};

// Get a single thing
exports.show = function(req, res) {
  Thing.findById(req.params.id, function (err, thing) {
    if(err) { return handleError(res, err); }
    if(!thing) { return res.send(404); }
    return res.json(thing);
  });
};

// Creates a new thing in the DB.
exports.create = function(req, res) {
  if (req.params && req.params.hasOwnProperty('campaign_id')) {
    Campaign.findOne({_id: req.params.campaign_id}, function (err, campaign) {
      if (err) return handleError(res, err);
      if (!campaign) { return res.send(404); }
      // _.each(req.body, function (thing) {
      //   thing.name = campaign.slug + thing.name;
      // });
      console.log("things to save: ");
      console.log(req.body);
      Thing.create(req.body, function(err, things) {
        if(err) { return handleError(res, err); }
        things.forEach(function (thing) {
          campaign.things.push(thing._id);
        });
        campaign.save(function (err, campaign) {
          if (err) return handleError(res, err);
          res.json(201, things);
        });
      });
    });
  }
  else {
    Thing.create(req.body, function(err, things) {
      if(err) { return handleError(res, err); }
      res.json(201, things);
    });
  }
};

// Updates an existing thing in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Thing.findById(req.params.id, function (err, thing) {
    if (err) { return handleError(res, err); }
    if(!thing) { return res.send(404); }
    var updated = _.merge(thing, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, thing);
    });
  });
};

// Deletes a thing from the DB.
exports.destroy = function(req, res) {
  Thing.findById(req.params.id, function (err, thing) {
    if(err) { return handleError(res, err); }
    if(!thing) { return res.send(404); }
    thing.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}