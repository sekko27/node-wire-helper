const _ = require('lodash');

/**
 * Iterate configurators passing the base parameter to them.
 *
 * @param base
 * @param {Array.<Function>} configurators
 * @returns base
 */
module.exports = function(base, configurators) {
  _.each(configurators, function(configurator) {
      configurator(base);
  });
  return base;
};
