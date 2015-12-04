'use strict';

var Promise = require('bluebird');
var spawn = require('child_process').spawn;

module.exports = function() {
  var args = Array.prototype.slice.call(arguments);

  return new Promise(function(resolve, reject) {
    var output = [];
    var spawned = spawn.apply(spawn, args);

    spawned.stdout.on('data', function(data) {
      output.push(data);
    });

    spawned.stderr.on('data', function(data) {
      output.push(data);
    });

    spawned.on('error', reject);

    spawned.on('close', function(code) {
      resolve({
        data: output.join(''),
        code: code,
      });
    });

  });

};
