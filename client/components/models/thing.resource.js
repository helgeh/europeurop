'use strict';

angular.module('europeuropApp')
  .factory('Thing', function ($resource) {
    return $resource('/api/campaigns/:campaign_id/things/:thing_id/:controller', {
      campaign_id: '@campaign_id',
      thing_id: '@_id'
    },
    {
      save: {
        method: 'POST',
        isArray: true
      },
      get: {
        isArray: true
      },
      download: {
        method: 'GET',
        params: {
          controller: 'file'
        }
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
