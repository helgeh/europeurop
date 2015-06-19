'use strict';

angular.module('europeuropApp')
  .controller('AdminCtrl', function ($scope, $http, Auth, Campaigns, Codes, Things, User, UploadModal, Notify) {


    /*----------------------------*/
    /*   GENERAL                  */
    /*----------------------------*/

    var isCreating,
      isEditing,
      campaign,
      codes,
      things;

    function initCreate() {
      $scope.newCampaign = {};
      $scope.newCodes = [];
      $scope.newThings = [];
      isCreating = true;
      isEditing = false;
    }

    function abortCreate() {
      isCreating = false;
      $scope.newCampaign = null;
      $scope.newCodes = null;
      $scope.newThings = null;
      $scope.campaign = null;
    }

    function initEdit(campaign) {
      isEditing = true;
      isCreating = false;
      // $scope.editedCampaign = angular.copy(campaign);
      $scope.editedCampaign = Campaigns.get({_id: campaign._id});
      Codes.query({campaign_id: campaign._id}, function (response) {
        $scope.editedCodes = response;
      });
      Things.query({campaign_id: campaign._id}, function (response) {
        console.log(response);
        $scope.editedThings = response.map(function (item) {
          // console.log("link: " + item.link);
          item.link = '/api/campaigns/' + campaign._id + '/things/' + item._id + '/files/' + item.name;
          console.log("edit: " + item.link);
          return item;
        });
        // $scope.editedThings = response;
      });
    }

    function abortEdit() {
      isEditing = false;
      $scope.editedCampaign = null;
      $scope.editedCodes = null;
      $scope.editedThings = null;
      $scope.campaign = null;
    }

    function shouldShowCreateForm() {
      return !!(isCreating && !isEditing);
    }

    function shouldShowEditForm() {
      return !!(isEditing && !isCreating);
    }

    function showNewCampaignButton() {
      return !(isEditing || isCreating);
    }

    // PUBLIC METHODS
    $scope.initCreate = initCreate;
    $scope.abortCreate = abortCreate;
    $scope.initEdit = initEdit;
    $scope.abortEdit = abortEdit;
    $scope.shouldShowCreateForm = shouldShowCreateForm;
    $scope.shouldShowEditForm = shouldShowEditForm;
    $scope.showNewCampaignButton = showNewCampaignButton;

    // PUBLIC PROPERTIES
    $scope.codesTotal = 10;

    // initialize
    abortEdit();
    abortCreate();





    /*-------------------------------*/
    /*   CREATE/UPDATE/ADD/PUT/POST  */
    /*-------------------------------*/

    function generateCodes() {
      var data = {total: $scope.codesTotal, motor: 'coupon-codes'};
      $scope.newCodes = Codes.generate(data, function (data) {
        Notify.success({text: 'New codes are ready for your campaign!'});
        $scope.newCodes = data;
      }, function (err) {
        Notify.error({text: 'Sorry! We could not generate new codes right now.'});
      });
    }

    function addMoreCodes(codes) {
      // TODO: logic for adding more codes to existing campaign
      Notify.error({text: 'NOT YET IMPLEMENTED!'});
    }

    function addFiles(campaign) {
      UploadModal.open(campaign, function (response) {
        if (response.status == "OK") {
          saveThings(campaign, response.imageUploads);
        }
      });
    }

    function saveThings (campaign, uploads) {
      var upload, i, things;
      things = [];
      for (i = 0; i < uploads.length; i++) {
        upload = uploads[i];
        name = upload.key.substr(upload.key.lastIndexOf('/') + 1);
        things.push({s3Object: upload, name: name});
      }
      Things.save({campaign_id: campaign._id}, things, function (data) {
        $scope.editedThings = data;
        Notify.success({text: 'Files connected to campaign.'});
      }, function (err) {
        Notify.error({text: 'Error connecting things to campaign. Try again.'});
      });
    }

    function createCampaign(campaign) {
      if ($scope.newCodes.length < 1) {
        Notify.warning({text: 'Generate some new codes first!'});
        return;
      }
      Campaigns.save(campaign, function (data) {
          $scope.campaign = data;
          var codes = $scope.newCodes.map(function (item) { return {value: item}; });
          Codes.save({campaign_id: $scope.campaign._id}, codes, function (data) {
            Notify.success({text: 'Campaign saved!'});
            $scope.codes = data;
            $scope.campaigns = Campaigns.query();
            abortCreate();
          },
          function (err) {
            Notify.error({text: 'Error saving campaign. Try again.'});
          });
        },
        function (err) {
          Notify.error({text: 'Error saving campaign. Try again.'});
        }
      );
    }

    function updateCampaign(campaign) {
      if ($scope.newCodes && $scope.newCodes.length > 0) {
        // TODO: save new codes first, then update...
        $scope.newCodes = null;
        updateCampaign(campaign);
      }
      else {
        Campaigns.save(campaign, function (data) {
          Notify.success({text: 'Campaign \"' + data.title + '\" updated!'});
          abortEdit();
          loadAllCampaigns();
        }, function (err) {
          Notify.error({text: 'Could not update right now. Try again.'});
        });
      }
    }

    // PUBLIC METHODS
    $scope.generateCodes = generateCodes;
    $scope.addMoreCodes = addMoreCodes;
    $scope.addFiles = addFiles;
    $scope.createCampaign = createCampaign;
    $scope.updateCampaign = updateCampaign;





    /*----------------------------*/
    /*   GET/READ/SHOW/VIEW/LIST  */
    /*----------------------------*/

    function loadCampaign(campaign) {
      $scope.campaign = campaign;
      initEdit(campaign);
    }

    function loadAllCampaigns() {
      $scope.campaigns = Campaigns.query();
    }

    function deleteUser(user) {
      User.remove({ id: user._id });
      angular.forEach($scope.users, function (u, i) {
        if (u === user) {
          $scope.users.splice(i, 1);
        }
      });
    }

    function openFile (thing) {
      downloadFile(thing, true);
    }

    function downloadFile (thing, open) {
      $http.get(thing.link + (open ? '' : '?download')).success(function (data) {
        if (data.policy) {
          if (open)
            $window.open(data.policy);
          else
            $("body").append("<iframe src='" + data.policy+ "' style='display: none;' ></iframe>");
        }
      }).error(function (data) {
        console.log('err');
        console.log(arguments);
      });
    }

    // PUBLIC METHODS
    $scope.loadCampaign = loadCampaign;
    $scope.deleteUser = deleteUser;
    $scope.downloadFile = downloadFile;

    // PUBLIC PROPERTIES
    $scope.campaigns = Campaigns.query();
    $scope.users = User.query();

    // initialize
    // loadAllCampaigns();
  });
