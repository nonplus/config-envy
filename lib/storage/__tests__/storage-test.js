'use strict';

var Promise = require('bluebird');
var fs = require('fs');
var path = require('path');
var getStorage = require('../');
var expect = require('chai').expect;

Promise.promisifyAll(fs);

var FIXTURES = path.join(__dirname, 'fixtures');

describe('lib/storage', function() {

  it('should fail if no download function is available', function() {
    expect(function() {
      getStorage(path.join(FIXTURES, 'no-download'));
    }).to.throw(/does not export a download function/);
  });

  it('should give default upload method', function() {
    var storage = getStorage(path.join(FIXTURES, 'no-upload'));

    return expect(storage.upload()).to.eventually.be.rejectedWith(/does not export an upload function/);
  });

  it('should default requiredOptions to an empty array', function() {
    var storage = getStorage(path.join(FIXTURES, 'no-options'));

    return expect(storage.requiredOptions).to.be.eql([]);
  });

  describe('fs adapter', function() {

    var storage = getStorage('fs');
    var LOCAL_CONFIG = path.join(FIXTURES, 'prod.env');
    var REMOTE_CONFIG = path.join(FIXTURES, 'prod-remote.env');

    function checkEquality() {
      return Promise.all([
        fs.readFileAsync(LOCAL_CONFIG, 'utf8'),
        fs.readFileAsync(REMOTE_CONFIG, 'utf8'),
      ]).spread(function(local, remote) {
        expect(local).to.be.equal(remote);
      });
    }

    before(function() {
      return fs
        .writeFileAsync(path.join(FIXTURES, 'prod.env'), 'FOO=bar\n')
        .then(function() {
          /* istanbul ignore next - We only catch here because the prod.env file may not exist */
          return fs.unlinkAsync(REMOTE_CONFIG).catch(function() {});
        });
    });

    it('should be able to upload files', function() {
      return storage
        .upload({ localPath: LOCAL_CONFIG, remotePath: REMOTE_CONFIG }, 'prod')
        .then(checkEquality);
    });

    it('should be able to download files', function() {
      return fs
        .writeFileAsync(REMOTE_CONFIG, 'HELLO_WORLD=foobar')
        .then(function() {
          return storage.download({ localPath: LOCAL_CONFIG, remotePath: REMOTE_CONFIG }, 'prod');
        })
        .then(checkEquality);
    });

  });

});
