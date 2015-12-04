'use strict';

var Promise = require('bluebird');
var fs = require('fs');
var aws = require('aws-sdk');

var API_VERSON = '2006-03-01';

exports.download = function(options, name) {
  var s3 = new aws.S3({
    apiVersion: API_VERSON,
    region: options.region,
  });

  return new Promise(function(resolve, reject) {
    var writeStream = fs.createWriteStream(options.localPath);
    var readStream = s3.getObject({
      Bucket: options.bucket,
      Key: options.key,
    }).createReadStream();

    readStream.pipe(writeStream)
      .on('error', reject)
      .on('close', resolve);
  }).then(function() {
    console.log('successfully downloaded "%s" config to "%s"', name, options.localPath);
  });
};

exports.upload = function(options, name) {
  var s3 = new aws.S3({
    apiVersion: API_VERSON,
    region: options.region,
  });

  return Promise.fromCallback(function(cb) {
    s3.putObject({
      Bucket: options.bucket,
      Key: options.key,
      Body: fs.createReadStream(options.localPath),
    }, cb);
  }).then(function() {
    console.log('successfully uploaded "%s" config to "%s/%s"', name, options.bucket, options.key);
  });
};

exports.requiredOptions = [ 'region', 'bucket', 'key' ];
