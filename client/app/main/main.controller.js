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

    $scope.submit = function() {
      console.log("submit : ", $scope.captcha);
      if ($scope.captcha && $scope.captcha !== '')
        validate($scope.secretInput);
    };

    // check if a code is valid
    function validate (code) {
      console.log("validating " + code);
      $http.post('/api/campaigns/validate/' + code, {captcha: $scope.captcha}).then(function (response) {
        console.log(response);
        if (response.isValid) {
          User.setCode(response.code);
        }
      });
    };

  });
