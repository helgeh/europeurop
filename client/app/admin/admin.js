'use strict';

angular.module('europeuropApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin', {
        templateUrl: 'app/admin/admin.html',
        controller: 'AdminCtrl'
      })
      .when('/admin/campaign', {
        templateUrl: 'app/admin/campaign/campaign.html',
        controller: 'CampaignCtrl'
      });;
  });