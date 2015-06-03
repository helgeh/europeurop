'use strict';

var myS3Account;
var bucket;

function setup () {
    if (!myS3Account) {
        var s3 = require('./s3policy');
        var config = require('../../config/environment');
        myS3Account = new s3(config.aws.accessKeyId, config.aws.secretAccessKey);
        bucket = config.aws.bucket;
    }
}

exports.getS3WritePolicy = function (req, res, next) {
    var file = req.params.file;

    setup();

                                    //   key,  bucket, dur,fs, acl,      cb
    var policy = myS3Account.writePolicy(file, bucket, 60, 10, 'private', function (response) {
        return res.send(200, response);
    });
}

exports.getS3ReadPolicy = function (req, res, next) {
    var file = req.params.file,
        download;

    file = 'campaignmedia/' + file;
    if ('download' in req.query) {
        download = file.substr(file.lastIndexOf('/')+1);
    }
    setup();

                                    //   key, bckt,  dur, dwnld, cb
    var policy = myS3Account.readPolicy(file, bucket, 60, download);
    return res.json(200, {policy: policy});
}

exports.getClientConfig = function (req, res, next) {
    setup();
    return res.json(200, {
        awsConfig: {
            bucket: bucket
        }
    });
};