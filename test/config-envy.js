'use strict';

var Promise = require('bluebird');
var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var configEnvy = require('../');
var ORIG_CWD = process.cwd();
var FIXTURES = path.join(__dirname, 'fixtures');
var ORIG_ENV = Object.create(process.env);

Promise.promisifyAll(fs);

describe('config-envy module', function() {

  before(function() {
    return Promise.all([
      fs.writeFileAsync(path.join(FIXTURES, 'config', 'prod.env'), 'FOO=bar\nHELLO=world'),
      fs.writeFileAsync(path.join(FIXTURES, 'config', 'staging.env'), 'FOO=foo\nHELLO=hello'),
    ]);
  });

  beforeEach(function() {
    process.chdir(FIXTURES);
  });

  afterEach(function() {
    process.chdir(ORIG_CWD);
    process.env = Object.create(ORIG_ENV);
  });

  it('should assign the environment variables to process.env', function() {
    configEnvy({ env: 'production' });
    expect(process.env.FOO).to.be.equal('bar');
    expect(process.env.HELLO).to.be.equal('world');
  });

  it('should assign the environment variables to process.env (different env)', function() {
    configEnvy({ env: 'stage' });
    expect(process.env.FOO).to.be.equal('foo');
    expect(process.env.HELLO).to.be.equal('hello');
  });

  it('should not override process.env', function() {
    process.env.FOO = 'some other value';
    configEnvy({ env: 'production' });
    expect(process.env.FOO).to.be.equal('some other value');
  });

  it('should be able to override process.env', function() {
    process.env.FOO = 'some other value';
    configEnvy({ env: 'production', overrideProcess: true });
    expect(process.env.FOO).to.be.equal('bar');
  });

  it('should be fine if different env gets loaded', function() {
    /* eslint no-undefined: 0 */
    configEnvy({ env: 'dev', silent: false });
    expect(process.env.FOO).to.be.equal(undefined);
  });

  it('should not extend the process', function() {
    var config = configEnvy({ env: 'production', extendProcess: false });

    expect(process.env.FOO).to.be.equal(undefined);
    expect(process.env.HELLO).to.be.equal(undefined);
    expect(config).to.be.eql({
      HELLO: 'world',
      FOO: 'bar',
    });
  });

});
