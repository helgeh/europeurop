'use strict';

angular.module('europeuropApp')
  .factory('Things', function ($resource) {
    return $resource('/api/campaigns/:campaign_id/things/:thing_id/:controller', {
      campaign_id: '@campaign_id',
      thing_id: '@_id'
    },
    {
      save: {
        method: 'POST',
        isArray: true
      }
      // changePassword: {
      //   method: 'PUT',
      //   params: {
      //     controller:'password'
      //   }
      // },
      // get: {
      //   method: 'GET',
      //   params: {
      //     id:'me'
      //   }
      // }
    });
  });
