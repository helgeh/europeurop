'use strict'

angular.module('europeuropApp')
  .service('CampaignsModel', function ($http, $q) {
      var model = this,
          URLS = {
              FETCH: 'api/campaigns/'
          },
          campaigns,
          currentCampaign;

      function extract(result) {
          return result.data;
      }

      function cacheCampaigns(result) {
          campaigns = extract(result);
          return campaigns;
      }

      model.getCampaigns = function() {
          return (campaigns) ? $q.when(campaigns) : $http.get(URLS.FETCH).then(cacheCampaigns);
      };

      model.setCurrentCampaign = function(campaign) {
          return model.getCampaignById(campaign).then(function(campaign) {
              currentCampaign = campaign;
          })
      };

      model.getCurrentCampaign = function() {
          return currentCampaign;
      };

      model.getCurrentCampaignId = function() {
          return currentCampaign ? currentCampaign._id : '';
      };

      model.getCampaignById = function(campaignId) {
          var deferred = $q.defer();

          function findCampaign(){
              return _.find(campaigns, function(c){
                  return c._id == campaignId;
              })
          }

          if(campaigns) {
              deferred.resolve(findCampaign());
          } else {
              model.getCampaigns()
                  .then(function() {
                      deferred.resolve(findCampaign());
                  });
          }

          return deferred.promise;
      };
    })
  ;