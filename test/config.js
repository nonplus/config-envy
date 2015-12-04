'use strict';

var path = require('path');
var configConfig = require('../lib/config');
var expect = require('chai').expect;
var ORIG_CWD = process.cwd();
var FIXTURES = path.join(__dirname, 'fixtures');

describe('lib/config', function() {

  afterEach(function() {
    process.chdir(ORIG_CWD);
  });

  it('should respect the given rc config file', function() {
    process.chdir(FIXTURES);
    var config = configConfig();

    expect(config).to.have.deep.property('projectName', 'config-envy');
    expect(config).to.have.deep.property('storage', 'fs');
    expect(config).to.have.deep.property('defaults.env', '{laneKey}');
    expect(config).to.have.deep.property('defaults.local', 'config/{laneKey}.env');
    expect(config).to.have.deep.property('defaults.remotePath', 'config/{laneKey}-remote.env');
  });

  it('should fill out the default values and fill in template values', function() {
    process.chdir(FIXTURES);
    var config = configConfig();

    expect(config).to.have.deep.property('lanes.prod.env', 'production');
    expect(config).to.have.deep.property('lanes.prod.local', 'config/prod.env');
    expect(config).to.have.deep.property('lanes.prod.remotePath', 'config/prod-remote.env');
    expect(config).to.have.deep.property('lanes.stage.env', 'stage');
    expect(config).to.have.deep.property('lanes.stage.local', 'config/staging.env');
    expect(config).to.have.deep.property('lanes.stage.remotePath', 'config/stage-remote.env');
  });

});
