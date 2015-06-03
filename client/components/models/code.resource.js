'use strict';

angular.module('europeuropApp')
  .factory('Codes', function ($resource) {
    return $resource('/api/campaigns/:campaign_id/codes/:code_id/:controller', {
      campaign_id: '@campaign_id',
      code_id: '@_id'
    },
    {
      generate: {
        method: 'GET',
        isArray: true,
        params: {
          controller: 'generate',
          campaign_id: 0,
          total: '@total',
          motor: '@motor',
        }
      },
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
