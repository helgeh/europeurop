'use strict';

module.exports = function(app) {
  var env = app.get('env');
	return function(req, res, next) {
	  if (req.protocol === 'https' || env !== 'production') {
	    next();
	  }
	  else {
	    res.redirect(301, { "Location": "https://" + req.headers.host + req.url });
	    res.end();
	  }
	}
};