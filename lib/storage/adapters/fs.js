'use strict';

var Promise = require('bluebird');
var fs = require('fs');

exports.download = function(options, name) {
  return new Promise(function(resolve, reject) {
    var writeStream = fs.createWriteStream(options.localPath);
    var readStream = fs.createReadStream(options.remotePath);

    readStream.pipe(writeStream)
      .on('error', reject)
      .on('close', resolve);
  }).then(function() {
    console.log('successfully read "%s" config fo "%s"', name, options.localPath);
  });
};

exports.upload = function(options, name) {
  return new Promise(function(resolve, reject) {
    var writeStream = fs.createWriteStream(options.remotePath);
    var readStream = fs.createReadStream(options.localPath);

    readStream.pipe(writeStream)
      .on('error', reject)
      .on('close', resolve);
  }).then(function() {
    console.log('successfully wrote "%s" config fo "%s"', name, options.remotePath);
  });
};

exports.requiredOptions = [ 'remotePath' ];
