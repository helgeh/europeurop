'use strict';

var compose = require('composable-middleware');
var request = require('request');
var config = require('../../config/environment');



/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function validate() {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      var verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
      var captcha = req.body.captcha;
      var postData = {
        secret: config.secrets.grecaptcha,
        response: captcha
      };
      request.post({url: verifyUrl, form: postData}, function (err, httpResponse, body) {
        if (err) return next(err);
        var response = JSON.parse(body);
        if (!response.success)
          return res.json(200, {message: 'Not valid inputs', captcha: true});
        if (response.success) {
          next();
        }
      });
    });
}


exports.validate = validate;
