_ = require('lodash')
_.mixin(require('lodash-deep'))
w = require 'when'

sub = (resolver, componentDef, wire) ->
  createInstance = (module, path, args) ->
    _.deepGet(module, path).apply null, args

  options = componentDef.options
  module = options.module
  args = if _.isArray(options.args) then wire(options.args) else []
  [ref, path] = _.rest module.match /^([^#]+)#(.*)$/
  referenced = wire($ref: ref)
  instance = w.join(referenced, path, args).spread(createInstance)
  resolver.resolve(instance)

module.exports =
  ->
    factories:
      sub: sub
