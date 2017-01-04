'use strict';

var Promise = require('bluebird');
var fs = require('fs');
var aws = require('aws-sdk');

exports.download = function(options) {

  aws.config.update({ region: options.region });
  var s3Client = require('node-s3-encryption-client');

  return getObject()
    .then(writeLocal);

  function getObject() {
    return Promise.fromCallback(function(cb) {
      s3Client.getObject({
        Bucket: options.bucket,
        Key: options.key,
        EncryptionContext: encryptionContext(options),
      }, cb);
    })
      .then(function(data) {
        return data.Body;
      });
  }

  function writeLocal(data) {
    return Promise.fromCallback(function(cb) {
      fs.writeFile(options.localPath, data, null, cb);
    });
  }
};

exports.upload = function(options) {

  aws.config.update({ region: options.region });
  var s3Client = require('node-s3-encryption-client');

  return readLocal()
    .then(putObject);

  function readLocal() {
    return Promise.fromCallback(function(cb) {
      fs.readFile(options.localPath, null, cb);
    });
  }

  function putObject(body) {
    return Promise.fromCallback(function(cb) {
      s3Client.putObject({
        Bucket: options.bucket,
        Key: options.key,
        Body: body,
        KmsParams: {
          KeyId: options.cmk,
          KeySpec: 'AES_256',
          EncryptionContext: encryptionContext(options),
        },
      }, cb);
    });
  }

};

// See: http://docs.aws.amazon.com/kms/latest/developerguide/services-s3.html#s3-encryption-context
function encryptionContext(options) {
  return { 'aws:s3:arn': 'arn:aws:s3:::' + options.bucket + '/' + options.name };
}
exports.requiredOptions = [ 'region', 'bucket', 'key', 'cmk' ];
