'use strict';

angular.module('europeuropApp')
  .controller('MainCtrl', function ($scope, $http, $location, Auth, grecaptcha, Notify) {
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
      if ($scope.captcha && $scope.captcha !== '')
        validate($scope.secretInput);
    };

    // check if a code is valid
    function validate (code) {
      console.log("validating " + code);
      $http.post('/api/campaigns/validate/' + code, {captcha: $scope.captcha}).then(function (response) {
        if (response.data.isValid) {
          Auth.setPurchase(response.data.purchase);
          $location.path('/signup');
        }
        else if (response.data.captcha) {
          Notify.error({text: 'Looks like you\'re a robot!'}); // captcha not valid
        }
        else {
          Notify.error({text: 'We could not find your code. Sure you typed it right?'});
        }
        grecaptcha.reset();
      });
    };

  });
