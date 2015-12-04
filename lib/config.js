'use strict';

var assert = require('assert');
var assign = require('object-assign');
var replace = require('./replace');
var getStorage = require('./storage');
var rc = require('rc');

module.exports = function(cwd) {
  var config = rc('config-envy', {
    projectName: null,
    storage: null,
    defaults: {
      env: '{laneKey}',
      local: 'config/{laneKey}.env',
    },
    lanes: {},
  });

  // Make sure we have the required config properties
  assert(config.projectName, '[config-envy] You must define a projectName');
  assert(config.storage, '[config-envy] You must define a storage method');

  // Get the storage method
  config.storageMethod = getStorage(config.storage, cwd);

  // Go through each lane and normalize all of the properties
  Object.keys(config.lanes).forEach(function(laneKey) {
    // Assign the defaults
    var environment = assign(
      {},
      config.defaults,
      config.lanes[laneKey]
    );

    // Make sure that we have the required lane properties on each lane
    assert(laneKey !== 'all', '[config-envy] "all" cannot be the name of one of your lanes');
    assert(environment.env, '[config-envy] environment.' + laneKey + '.env is required');
    assert(environment.local, '[config-envy] environment.' + laneKey + '.key is required');

    // Make sure that we have the required options from the selected storage
    // method
    config.storageMethod.requiredOptions.forEach(function(option) {
      assert(environment[option], '[config-envy] environment.' + laneKey + '.' + option + ' is required by the storage method');
    });

    // Go through each of the properties on the lane and replace the string
    // values with the variables such as {laneKey} and {projectName}
    Object.keys(environment).forEach(function(key) {
      var path = 'lanes.' + laneKey + '.' + key;

      assert(typeof environment[key] === 'string', '[config-envy] ' + path + ' must be a string');

      environment[key] = replace(environment[key], {
        laneKey: laneKey,
        projectName: config.projectName,
      });
    });

    config.lanes[laneKey] = environment;

  });

  return config;
};


