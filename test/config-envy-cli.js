'use strict';

var Promise = require('bluebird');
var fs = require('fs');
var path = require('path');
var spawn = require('./utils/spawn');
var expect = require('chai').expect;
var ORIG_CWD = process.cwd();
var FIXTURES = path.join(__dirname, 'fixtures');
var CONFIG_ENVY = path.resolve(__dirname, '..', 'bin', 'config-envy.js');

Promise.promisifyAll(fs);

describe('config-envy cli', function() {

  before(function() {
    return Promise.all([
      fs.unlinkAsync(path.join(FIXTURES, 'config', 'prod.env')),
      fs.unlinkAsync(path.join(FIXTURES, 'config', 'staging.env')),
      fs.unlinkAsync(path.join(FIXTURES, 'config', 'prod-remote.env')),
    ]).catch(function() {});
  });

  beforeEach(function() {
    process.chdir(FIXTURES);
  });

  afterEach(function() {
    process.chdir(ORIG_CWD);
  });

  it('config-envy --list', function() {
    return spawn(CONFIG_ENVY, [ '--list' ]).then(function(res) {
      expect(res.code).to.be.equal(0);
      expect(res.data).to.be.equal('prod\nstage\n');
    });
  });

  it('config-envy --config', function() {
    return spawn(CONFIG_ENVY, [ '--config' ]).then(function(res) {
      expect(res.code).to.be.equal(0);
      expect(res.data).to.be.equal(path.join(FIXTURES, '.config-envyrc') + '\n');
    });
  });

  it('config-envy --init', function() {
    return spawn(CONFIG_ENVY, [ '--init' ]).then(function(res) {
      expect(res.code).to.be.equal(0);
      return Promise.all([
        fs.statAsync(path.join(FIXTURES, 'config', 'prod.env')),
        fs.statAsync(path.join(FIXTURES, 'config', 'staging.env')),
      ]);
    });
  });

  it('config-envy <lane>', function() {
    return spawn(CONFIG_ENVY, [ 'prod' ]).then(function(res) {
      expect(res.code).to.be.equal(0);
      expect(res.data).to.be.equal([
        'prod:',
        '{ env: \'production\',',
        '  local: \'config/prod.env\',',
        '  remotePath: \'config/prod-remote.env\' }',
        '\n',
      ].join('\n'));
    });
  });

  it('config-envy <lane> put', function() {
    return spawn(CONFIG_ENVY, [ 'prod', 'put' ]).then(function(res) {
      expect(res.code).to.be.equal(0);
      return fs.statAsync(path.join(FIXTURES, 'config', 'prod-remote.env'));
    });
  });

  it('config-envy <lane> get', function() {
    return Promise
      .all([
        fs.writeFileAsync(path.join(FIXTURES, 'config', 'prod-remote.env'), 'FOO=bar'),
        fs.unlinkAsync(path.join(FIXTURES, 'config', 'prod.env')),
      ])
      .then(function() {
        return spawn(CONFIG_ENVY, [ 'prod', 'get' ]).then(function(res) {
          expect(res.code).to.be.equal(0);
        });
      })
      .then(function() {
        return fs.readFileAsync(path.join(FIXTURES, 'config', 'prod.env'), 'utf8');
      })
      .then(function(data) {
        expect(data).to.be.equal('FOO=bar');
      });
  });

});
