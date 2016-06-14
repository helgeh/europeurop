/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');

module.exports = function(app) {

  // Redirect all http traffic
  var forceSSL = require('./components/utils/forcessl')(app);
  app.get('*', forceSSL);

  // Insert routes below
  app.use('/api/purchases', require('./api/purchase'));
  app.use('/api/campaigns', require('./api/campaign'));
  // app.use('/api/campaigns/:campaign_id/codes', require('./api/code'));
  // app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));

  // All things Amazon (AWS).
  app.use('/aws', require('./components/aws'));

  app.use('/auth', require('./auth'));

  app.use('/dev', require('./components/dev'));
  
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
