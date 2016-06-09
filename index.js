'use strict';

var fs = require('fs');
var path = require('path');
var assign = require('object-assign');
var dotenv = require('dotenv');
var getConfig = require('./lib/config');

module.exports = function(options) {
  options = assign({
    env: process.env.NODE_ENV,
    cwd: process.cwd(),
    localEnv: '.env',
    overrideProcess: false,
    silent: false,
    extendProcess: true,
  }, options);

  var config = getConfig(options.cwd);

  // Convert the lanes to be keys be the environment name
  var lanes = Object.keys(config.lanes).reduce(function(envLanes, key) {
    var lane = config.lanes[key];

    envLanes[lane.env] = lane;
    return envLanes;
  }, {});

  var lane = lanes[options.env] || {};

  var laneConfig = dotenv.parse(getFileBuffer(options.cwd, lane.local, options.silent));
  var homeConfig = dotenv.parse(getFileBuffer(options.cwd, options.localEnv, true));

  var env = assign({}, laneConfig, homeConfig);

  if (options.overrideProcess) {
    env = assign({}, process.env, env);
  } else {
    env = assign({}, env, process.env);
  }

  if (options.extendProcess) {
    process.env = env;
  }

  return env;
};

/**
 * @function getFileBuffer
 * @param {string} cwd - The current working directory
 * @param {string} localPath - The local path to try and read from
 * @param {boolean} silent - Whether or not to keep the logs silent
 * @return {Buffer} The buffer of the file, or an empty buffer if the file doesn't exist
 */
function getFileBuffer(cwd, localPath, silent) {
  if (!localPath) { return new Buffer(''); }

  var filepath = path.join(cwd, localPath);
  var buffer;

  try {
    buffer = fs.readFileSync(filepath);
  } catch (err) {
    if (!silent) { console.error(err); }
    buffer = new Buffer('');
  }
  return buffer;
}
