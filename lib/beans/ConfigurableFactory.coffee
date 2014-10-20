_ = require 'lodash'

module.exports = (base, configurators) ->
  _.each configurators, (configurator) ->
    configurator(base)
  base
