'use strict';

angular.module('europeuropApp')
  .controller('MainCtrl', function ($scope, $http, $location, Auth, Thing, grecaptcha) {

    $scope.user = Auth.getCurrentUser();
    $scope.formExpanded = true;


    /**
     * @private
     * Load a single code and its parent campaign
     */
    // function loadOne() {
    //   $http.get('/api/campaigns/' + $scope.currentCampaign._id + '/codes/' + $scope.currentCodes[3]._id).then(function (response) {
    //     $scope.testCode = response.data;
    //     Notify.success({text: 'Loaded a single code ' + response.data.value});
    //   })
    // }

    function showRedeemForm() {
      return !!(!Auth.hasPurchase() || $scope.formExpanded);
    }
    $scope.showRedeemForm = showRedeemForm;

    function submit() {
      if ($scope.captcha && $scope.captcha !== '')
        validate($scope.secretInput);
    }
    $scope.submit = submit;

    // check if a code is valid
    function validate (code) {
      console.log("validating " + code);
      $http.post('/api/campaigns/0/codes/' + code + '/validate', {captcha: $scope.captcha}).then(function (response) {
        if (response.data.isValid) {
          Auth.setPurchase(response.data.purchase);
          if (!Auth.isLoggedIn()) {
            $location.path('/login');
          }
          else {
            Auth.savePurchase().then(function (response) {
              $scope.user = Auth.getCurrentUser();
            });
          }
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
