#! /usr/bin/env node

'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var program = require('commander');
var config = require('../lib/config')(process.cwd());
var version = require('../package.json').version;
var mkdirp = require('mkdirp');

program
  .version(version)
  .usage('[options] <lane|all> [get|set]')
  .option('-l, --list', 'List the available lanes')
  .option('-c, --config', 'Show the paths to the configuration files that are being used')
  .option('-i, --init', 'Initialize the local .env files')
  .parse(process.argv);

// --config
if (program.config) {
  console.log(config.configs.join('\n'));
  process.exit(0);
}

// --list
if (program.list) {
  console.log(Object.keys(config.lanes).join('\n'));
  process.exit(0);
}

// --init
// Initializes the local .env files
if (program.init) {
  Object.keys(config.lanes).forEach(function(laneKey) {
    var lane = config.lanes[laneKey];
    var filepath = path.join(process.cwd(), lane.local);

    try {
      fs.statSync(filepath);
      console.warn('"' + lane.local + '" alread exists');
    } catch (err) {
      fs.writeFileSync(filepath, '\n');
      console.log('created "' + lane.local + '"');
    }
  });
  process.exit(0);
}

// Parse the lane and methods out
var laneName = program.args[0];
var method = program.args[1];

method = method ? method.toLowerCase() : null;

if (laneName === 'all') {
  Object.keys(config.lanes).forEach(function(name) {
    processLane(config.lanes[name], name);
  });
} else {
  processLane(config.lanes[laneName], laneName);
}

function processLane(lane, name) {
  // If the lane doesn't exist in the config, tell the user
  assert(lane, '"' + name + '" is not a valid lane. Use --list to view the possible lanes');

  // If no method is specified, display the lane information
  if (!method) {
    console.log(name + ':');
    console.log(lane);
    console.log();
    return;
  }

  // get or put based on the argument given
  lane.localPath = path.join(process.cwd(), lane.local);

  switch (method) {
    case 'get':
      mkdirp(path.dirname(lane.localPath));
      config.storageMethod.download(lane, name);
      break;
    case 'put':
      config.storageMethod.upload(lane, name);
      break;
    default:
      throw new Error('Method needs to be "get" or "put". "' + method + '" given.');
  }
}
