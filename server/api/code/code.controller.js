'use strict';

var _ = require('lodash');
var cc = require('coupon-code');
var rndstrings = require('../../components/utils/random-strings');
var Code = require('./code.model');
var Campaign = require('../campaign/campaign.model');

// Get list of codes
exports.index = function(req, res) {
  Code.find({campaign: req.params.campaign_id}, function (err, codes) {
    if(err) { return handleError(res, err); }
    return res.json(200, codes);
  });
};

// Get array of newly generated codes, ready for creation
exports.generate = function (req, res) {
  var tot = req.query.total;
  if (req.query.motor == 'coupon-codes') {
    var ret = [];
    for (var i = 0; i < tot; i++) {
      ret.push(cc.generate());
    }
    res.json(200, ret);
  }
  else {
    rndstrings({length: 8, total: tot, urlsafe: true}, function(sr) {
      res.json(200, sr);
    });
  }
};

exports.validate = function (req, res) {
  var motor = req.query.motor;
  var input = cc.validate(req.params.code);
  if (input.length < 1)
    return handleError(res, {message: 'Not valid'});
  Code
    .findOne({value: input})
    .exec(function (err, code) {
      if (err) return handleError(res, err);
      if (!code) return res.json(200, 'Not found');
      var isValid = !!(input == code.value);
      res.json(200, {isValid: isValid, code: code});
    });
  // res.json(200, {isValid: cc.validate(req.query.code).length > 0});
}

// Get a single code
exports.show = function(req, res) {
  Code.findOne({_id: req.params.id, campaign: req.params.campaign_id})
    .populate('campaign')
    .exec(function (err, code) {
      if (err) return handleError(res, err);
      res.json(201, code);
    });
  // Code.findOne({_id: req.params.id, campaign: req.params.campaign_id}, function (err, code) {
  //   if(err) { return handleError(res, err); }
  //   if(!code) { return res.send(404); }
  //   return res.json(code);
  // });
};

// Creates a new code in the DB.
exports.create = function(req, res) {
  Campaign.findOne({_id: req.params.campaign_id}, function (err, campaign) {
    if (err) return handleError(res, err);
    if(!campaign) { return res.send(404); }
    // We have a campaign!
    req.body.forEach(function (item) {
      item.campaign = campaign._id;
    });
    Code.create(req.body, onInsert);
    function onInsert(err, codes) {
      if(err) return handleError(res, err);
      codes.forEach(function (code) {
        campaign.codes.push(code._id);
      });
      campaign.save(function (err, campaign) {
          if (err) return handleError(res, err);
          res.json(201, codes);
      });
    }
  });
};

// Updates an existing code in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Code.findOne({_id: req.params.id, campaign: req.params.campaign_id}, function (err, code) {
    if (err) { return handleError(res, err); }
    if(!code) { return res.send(404); }
    var updated = _.merge(code, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, code);
    });
  });
};

// Deletes a code from the DB.
exports.destroy = function(req, res) {
  Code.findOne({_id: req.params.id, campaign: req.params.campaign_id}, function (err, code) {
    if(err) { return handleError(res, err); }
    if(!code) { return res.send(404); }
    code.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}