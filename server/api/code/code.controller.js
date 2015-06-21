'use strict';

var _ = require('lodash');
var cc = require('coupon-code');
var rndstrings = require('../../components/utils/random-strings');
var Code = require('./code.model');
var Purchase = require('../purchase/purchase.model');
var Campaign = require('../campaign/campaign.model');
var User = require('../user/user.model');

// Get list of codes
exports.index = function(req, res) {
  Code.find({campaign: req.params.campaign_id}, '-s3Object', function (err, codes) {
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
  var input = req.params.code;
  var motor = req.query.motor;
  console.log(req.params);
  // if (motor === undefined || motor == 'coupon-codes')
    input = cc.validate(input);
  if (input.length < 1)
    return res.json(200, {message: 'Not valid code'});
  else {
    var query = Code.findOne({value: input});
    if (req.user && req.user.role === 'admin')
      query.populate('campaign')
    else
      query.populate('campaign', '-codes');
    query.exec(function (err, code) {
      if (err) return handleError(res, err);
      if (!code || !code.active) return res.json(200, {message: 'Not found'});
      var p = new Purchase({active: false});
      p.code_id = code._id;
      p.campaign = code.campaign;
      console.log('user: ', req.user);
      if (req.user)
        p.user_id = req.user._id;
      p.save(function (err, p) {
        if (err) return handleError(res, err);
        code.redeemed = true;
        code.save(function (err) {
          res.json(200, {isValid: true, purchase: p});
        })
      });
    });
  }
};

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
        code.active = true;
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
  console.log("handleError... ", err);
  return res.send(500, err);
}
