'use strict';

angular.module('europeuropApp')
  .controller('DevCtrl', function ($scope, $http, $location) {
    $scope.isDev = false;
    $scope.dev = {menu: []};
    $http.get('/dev/menu').then(function (response) {
      $scope.dev = response.data;
      $scope.isDev = !!(response.data.menu && response.data.menu.length);
    });
    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
