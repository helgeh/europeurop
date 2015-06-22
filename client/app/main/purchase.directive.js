'user strict';

angular.module('europeuropApp')
  .directive('purchase', ['$http', '$window', 'Thing', 'Modal', function ($http, $window, Thing, Modal) {
    return {
      restrict: 'EA',
      templateUrl: 'app/main/purchase.html',
      scope: {
        campaign: '='
      },
      link: function (scope, el, at) {
        var campaign = scope.campaign || {};
        var showImage = Modal.show.image();
        scope.things = [];

        if (campaign._id) {
          scope.things = Thing.query({campaign_id: campaign._id || '0'});
        }

        function openFile (thing) {
          Thing.download({campaign_id: campaign._id, thing_id: thing._id}, function (data) {
            if (data.policy) {
              // $window.open(data.policy);
              showImage({title: thing.name, src: data.policy})
            }
          });
        }

        function downloadFile (thing) {
          Thing.download({campaign_id: campaign._id, thing_id: thing._id, download: 'download'}, function (data) {
            if (data.policy) {
              $("body").append("<iframe src='" + data.policy+ "' style='display: none;' ></iframe>");
            }
          });
        }

        scope.openFile = openFile;
        scope.downloadFile = downloadFile;
      }
    };
  }]);