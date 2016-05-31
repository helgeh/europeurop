'use strict'

angular.module('europeuropApp')
.service('Aws', ['$http', '$rootScope', 'Upload', function ($http, $rootScope, Upload) {

    this.getFile = function (fileName) {
        return $http.get('/aws/s3Policy/' + fileName + '/read').then(function (response) {
            var s3Params = response.data;
        })
    }

    function sanitize(str) {
      return str.replace(/å/gi, 'a').replace(/æ/gi, 'ae').replace(/ø/gi, 'o').replace(/[^a-z0-9_\.\-]/gi, '_');
    }

    this.uploadFile = function(path, file) {
       return $http.get('/aws/s3Policy/' + file.name + '/write').then(function (response) {
            var s3Params = response.data;
            var upload = Upload.upload({
                url: 'https://' + $rootScope.config.awsConfig.bucket + '.s3.amazonaws.com/',
                method: 'POST',
                transformRequest: function (data, headersGetter) {
                    //Headers change here
                    var headers = headersGetter();
                    delete headers['Authorization'];
                    return data;
                },
                formDataAppender: function (formData, key, value) {
                    // modulen gjør noe rart med dataene og sender feil formatert 
                    // til s3. Gjør jeg dette funker det...
                    for (var k in value) {
                        if (value.hasOwnProperty(k)) 
                            formData.append(k, value[k]);
                    }
                },
                data: {
                    'key' : path + sanitize(file.name), // '${filename}', //''+ Math.round(Math.random()*10000) + '$$' + file.name,
                    'acl' : s3Params.acl,
                    'Content-Type' : s3Params.mime,
                    'AWSAccessKeyId': s3Params.s3Key,
                    'success_action_status' : '201',
                    'policy' : s3Params.s3PolicyBase64,
                    'signature' : s3Params.s3Signature
                },
                file: file,
            });
            return upload;
        });
    }
}]);