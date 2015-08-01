'use strict';

angular.module('europeuropApp')
  .controller('AdminCtrl', function ($scope, $http, $window, Auth, Campaigns, Codes, Thing, User, Modal, UploadModal) {


    /*----------------------------*/
    /*   GENERAL                  */
    /*----------------------------*/

    var isCreating,
      isEditing,
      campaign,
      codes,
      things;

    var showImage = Modal.show.image(function (test) { console.log(test); });
    $scope.codesCollapsed = true;
    $scope.thingsCollapsed = true;


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
      // $scope.createForm.$setPristine();
    }

    function initEdit(campaign) {
      isEditing = true;
      isCreating = false;
      // $scope.editedCampaign = Campaigns.get({id: campaign._id}, function () {
      $scope.editedCampaign = angular.copy(campaign);
      Codes.query({campaign_id: campaign._id}, function (response) {
        $scope.editedCodes = response;
      });
      Thing.query({campaign_id: campaign._id}, function (response) {
        $scope.editedThings = response;
      });
    }

    function abortEdit() {
      isEditing = false;
      $scope.editedCampaign = null;
      $scope.editedCodes = null;
      $scope.editedThings = null;
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
      Thing.save({campaign_id: campaign._id}, things, function (data) {
        $scope.editedThings = $scope.editedThings.concat(data);
        Notify.success({text: 'Files connected to campaign.'});
        $scope.editedCampaign = Campaigns.get({id: campaign._id});
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
          $scope.newCampaign = data;
          var codes = $scope.newCodes.map(function (item) { return {value: item}; });
          Codes.save({campaign_id: $scope.newCampaign._id}, codes, function (data) {
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

    function updateCampaign(campaign, editForm) {
      if ($scope.newCodes && $scope.newCodes.length > 0) {
        // TODO: save new codes first, then update...
        // campaign.codes = $scope.newCodes;
        console.log(campaign.codes);
        $scope.newCodes = null;
        // updateCampaign(campaign);
      }
      if (editForm.$pristine) 
        return abortEdit();

      // else {
        Campaigns.save(campaign, function (data) {
          Notify.success({text: 'Campaign \"' + data.title + '\" updated!'});
          abortEdit();
          loadAllCampaigns();
        }, function (err) {
          Notify.error({text: 'Could not update right now. Try again.'});
        });
      // }
    }

    function deleteCampaign (campaign) {
      Campaigns.remove({id: campaign._id});
      angular.forEach($scope.campaigns, function (c, i) {
        if (c._id == campaign._id)
          $scope.campaigns.splice(i, 1);
      });
      abortEdit();
    }

    // PUBLIC METHODS
    $scope.generateCodes = generateCodes;
    $scope.addMoreCodes = addMoreCodes;
    $scope.addFiles = addFiles;
    $scope.createCampaign = createCampaign;
    $scope.updateCampaign = updateCampaign;
    $scope.deleteCampaign = deleteCampaign;





    /*----------------------------*/
    /*   GET/READ/SHOW/VIEW/LIST  */
    /*----------------------------*/

    function loadCampaign(campaign) {
      // $scope.campaign = campaign;
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

    function openFile (campaign, thing) {
      Thing.download({campaign_id: campaign._id, thing_id: thing._id}, function (data) {
        if (data.policy) {
          showImage({title: thing.name, src: data.policy});
        }
      });
    }

    function downloadFile (campaign, thing) {
      console.log(thing);
      Thing.download({campaign_id: campaign._id, thing_id: thing._id, download: 'download'}, function (data) {
        if (data.policy) {
          $("body").append("<iframe src='" + data.policy+ "' style='display: none;' ></iframe>");
        }
      });
    }


    // PUBLIC METHODS
    $scope.loadCampaign = loadCampaign;
    $scope.deleteUser = deleteUser;
    $scope.openFile = openFile;
    $scope.downloadFile = downloadFile;

    // PUBLIC PROPERTIES
    $scope.campaigns = Campaigns.query();
    $scope.users = User.query();

    // initialize
    // loadAllCampaigns();
  });
