'use strict';

var _ = require('lodash');
var cc = require('coupon-code');
var rndstrings = require('../../components/utils/random-strings');
var Code = require('./code.model');
var Purchase = require('../purchase/purchase.model');
var Campaign = require('../campaign/campaign.model');
var User = require('../user/user.model');
var request = require('request');

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
  var verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
  var captcha = req.body.captcha;
  var postData = {
    secret: '6LeySwgTAAAAAJMaA9aAKNbc3LSUAUtdyocTZ3d6',
    response: captcha
  };
  request.post({url: verifyUrl, form: postData}, function (err, httpResponse, body) {
    var response = JSON.parse(body);
    if (!response.success)
      return res.json(200, {message: 'Not valid inputs', captcha: true});
    if (response.success) {
      var input = req.params.code;
      var motor = req.query.motor;
      // if (motor === undefined || motor == 'coupon-codes')
        input = cc.validate(input);
      if (input.length < 1)
        return res.json(200, {message: 'Not valid code'});
      else {
        Code
          .findOne({value: input})
          .populate('campaign')
          .exec(function (err, code) {
            if (err) return handleError(res, err);
            if (!code || !code.active) return res.json(200, 'Not found');
            var isValid = !!(input == code.value);
            if (isValid) {
              var p = new Purchase();
              p.code_id = code._id;
              p.campaign_id = code.campaign_id;
              p.save();
              res.json(200, {isValid: isValid, purchase: p});
            }
          });
      }
    }
  });
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
