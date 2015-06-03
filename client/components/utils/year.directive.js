'use strict';

angular.module('europeuropApp')
  .directive('year', function() {
    return {
      restrict: 'E',
      link: function (scope, el, at) {
        el.text(new Date().getFullYear());
      }
    };
  });