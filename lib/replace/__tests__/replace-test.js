'use strict';

var replace = require('../');
var expect = require('chai').expect;

describe('lib/replace', function() {

  it('should replace values in a string', function() {
    expect(replace('{foo}', { foo: 'bar' })).to.be.equal('bar');
  });

  it('should take multiple object arguments', function() {
    expect(replace('{first} {last}', { first: 'Jack' }, { last: 'Bliss' })).to.be.equal('Jack Bliss');
  });

});
