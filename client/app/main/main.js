'use strict';

angular.module('europeuropApp')
  .config(function ($routeProvider) {
    // NÅ BLIR JEG SNART SUR!
    $routeProvider
      .when('/', {
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      });
  });