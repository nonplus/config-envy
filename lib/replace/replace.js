'use strict';

var format = require('string-template');
var assign = require('object-assign');

/**
 * @function replace
 * @param {string} str - The string to replace variable pieces of. Variables are
 * wrapped in curly brackets. e.g. '{firstName} {lastName}'
 * @param {...Object} obj - The objects to use to fill out the variables.
 * @returns {String} The string with the values replaced.
 */
module.exports = function replace(str) {
  var srcObjects = Array.prototype.slice.call(arguments, 1);

  srcObjects.unshift({});

  return format(str, assign.apply(null, srcObjects));
};
