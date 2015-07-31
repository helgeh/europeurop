'use strict';

angular.module('europeuropApp')
  .factory('UploadModal', function ($rootScope, $modal, Aws) {

    var modalScope;
    var imageUploads = [];
    var file;
    var uploadModal;

    /**
     * Opens a modal
     * @param  {Object} scope      - an object to be merged with modal's scope
     * @param  {String} modalClass - (optional) class(es) to be applied to the modal
     * @return {Object}            - the instance $modal.open() returns
     */
    function openModal(scope, modalClass) {
      modalScope = $rootScope.$new();
      scope = scope || {};
      modalClass = modalClass || 'modal-default';

      angular.extend(modalScope, scope);

      return $modal.open({
        templateUrl: 'components/aws/uploadModal.html',
        windowClass: modalClass,
        scope: modalScope
      });
    }

    function uploadComplete (response) {
      response.config.file.progress = parseInt(100);
      if (response.status === 201) {
        var data = xml2json.parser(response.data),
            parsedData;
        parsedData = {
          location: data.postresponse.location,
          bucket: data.postresponse.bucket,
          key: data.postresponse.key,
          etag: data.postresponse.etag
        };
        imageUploads.push(parsedData);
      }
      else { 
        // TODO: apply better error 
        // alert('Upload Failed');
      }
    }

    function uploadError (error) {
        // TODO: apply better error 
      // console.log('uplaod error', error);
      // alert('ERROR!');
    }

    function uploadNotify (event) {
      event.config.file.progress =  parseInt(100.0 * event.loaded / event.total);
    }

    // Public API here
    return {
      open: function(currentCampaign, callback) {
        callback = callback || angular.noop;
        var result = {}, path;

        if (!currentCampaign) {
          console.log("No campaign provided for uploadModal.js");
          return;
        }

        path = 'campaignmedia/' + currentCampaign.slug + '/';

        uploadModal = openModal({
          onFileSelect: function ($files) {
            // TODO: don't know why this gets called before files select window is even opened.
            // Fix ugly workaround later
            if (!$files)
              return;
            modalScope.files = $files;
            var uploads = [];
            for (var i = 0; i < $files.length; i++) {
              file = $files[i];
              file.progress = parseInt(0);
              (function (path, file, i) {
                Aws
                  .uploadFile(path, file)
                  .then(uploadComplete, uploadError, uploadNotify);
              }(path, file, i));
            }
          },
          backdrop: false,
          modal: {
            // dismissable: true,
            title: 'Upload',
            buttons: [{
              classes: 'btn-login',
              text: 'OK',
              click: function(e) {
                if (imageUploads.length > 0) {
                  result.imageUploads = imageUploads;
                  result.status = 'OK';
                }
                uploadModal.close(e);
              }
            }, {
              classes: 'btn-default',
              text: 'Cancel',
              click: function(e) {
                result.imageUploads = [];
                result.status = 'Canceled';
                uploadModal.dismiss(e);
              }
            }]
          }
        }, 'modal-default');

        uploadModal.result.then(function(event) {
          callback(result);
        });
      }
    };
  });
