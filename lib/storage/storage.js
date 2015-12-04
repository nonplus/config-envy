'use strict';

var Promise = require('bluebird');
var path = require('path');
var assert = require('assert');

module.exports = function(adapterPath, cwd) {
  cwd = cwd || process.cwd();

  // Get a built in adapter or require the one given
  var adapter = builtIn(adapterPath) || require(path.resolve(cwd, adapterPath));

  // adapter.download is a required function
  assert(typeof adapter.download === 'function', '[config-envy] adapter at "' + adapterPath + '" does not export a download function');

  // adapter.upload is optional, but the user should know that the adapter won't actually download
  if (typeof adapter.upload !== 'function') {
    adapter.upload = function() {
      return Promise.reject(new Error('[config-envy] adapter at "' + adapterPath + '" does not export an upload function'));
    };
  }

  // adapter.requiredOptions must be an array
  if (!Array.isArray(adapter.requiredOptions)) {
    adapter.requiredOptions = [];
  }

  return adapter;
};

function builtIn(name) {
  try {
    return require('./adapters/' + name);
  } catch (err) {
    return false;
  }
}
