_ = require('lodash')
w = require 'when'

sub = (resolver, componentDef, wire) ->
  createInstance = (module, path, args) ->
    _.get(module, path).apply null, args

  options = componentDef.options
  module = options.module
  args = if _.isArray(options.args) then wire(options.args) else []
  [ref, path] = _.tail module.match /^([^#]+)#(.*)$/
  referenced = wire($ref: ref)
  instance = w.join(referenced, path, args).spread(createInstance)
  resolver.resolve(instance)

module.exports =
  ->
    factories:
      sub: sub
