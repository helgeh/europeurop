'use strict';

angular.module('europeuropApp')
  .factory('Campaigns', function ($resource) {
    return $resource('/api/campaigns/:id/:controller', {
      id: '@_id'
    },
    {
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
