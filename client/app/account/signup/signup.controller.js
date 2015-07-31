'use strict';

angular.module('europeuropApp')
  .controller('SignupCtrl', function ($scope, Auth, $location, $window, Notify) {
    $scope.user = {};
    $scope.errors = {};

    function hasPurchase () {
      return Auth.hasPurchase();
    }
    $scope.hasPurchase = hasPurchase;

    $scope.register = function(form) {
      $scope.submitted = true;

      var values = {
          name: $scope.user.name,
          email: $scope.user.email,
          password: $scope.user.password
        };
      if (hasPurchase())
        values.purchase_id = Auth.getPurchase()._id;

      function savePurchase () {
        Auth.savePurchase().then(function (response) {
          Notify.success({text: 'Success!'});
          $scope.user = Auth.getCurrentUser();
        });
      }

      if(form.$valid) {
        Auth.createUser(values)
        .then( function() {
          // Account created, redirect to home
          if (hasPurchase()) 
            savePurchase();
          $location.path('/');
        })
        .catch( function(err) {
          err = err.data;
          $scope.errors = {};

          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, function(error, field) {
            form[field].$setValidity('mongoose', false);
            $scope.errors[field] = error.message;
          });
        });
      }
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  });
