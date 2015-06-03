'use strict';

angular.module('europeuropApp')
  .controller('MainCtrl', function ($scope, $http, $location, User) {
    $scope.awesomeThings = [];

    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };



    /**
     * @private
     * Load a single code and its parent campaign
     */
    function loadOne() {
      $http.get('/api/campaigns/' + $scope.currentCampaign._id + '/codes/' + $scope.currentCodes[3]._id).then(function (response) {
        $scope.testCode = response.data;
        Notify.success({text: 'Loaded a single code ' + response.data.value});
      })
    }

    // check if a code is valid
    $scope.validate = function (code) {
      console.log("validating " + code);
      $http.get('/api/campaigns/validate/' + code).then(function (response) {
        console.log(response);
        if (response.isValid) {
          User.setCode(response.code);
        }
      });
    };

  });
