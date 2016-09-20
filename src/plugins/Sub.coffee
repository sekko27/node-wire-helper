_ = require('lodash')
w = require 'when'

sub = (resolver, componentDef, wire) ->
  createInstance = (referencedModule, path, args) ->
    switch componentDef.options.factory
      when 'function'
        _.get(referencedModule, path).apply null, args
      else
        _.get(referencedModule, path)

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
