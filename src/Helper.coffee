_ = require 'lodash'

H =
  ########################################
  # Use references easily
  ref: (name) ->
    $ref: name

  refs: (names) ->
    _.map names, H.ref

  environment: ->
    process.env['NODE_ENV'] ? 'production'

  env: (cases) ->
    if _.has cases, H.environment()
      _.result cases, H.environment()
    else if _.has cases, 'default'
      _.result cases, 'default'

  envVar: (name, def) ->
    if process.env[name]
      value = process.env[name]
      console.log "Using #{name} environment variable: #{value}"
      value
    else
      console.log "Using default value for #{name} environment variable: #{def}"
      def

  prepareArg: (arg) ->
    if _.isString arg
      match = arg.match /^=>(.+)$/
      if match then H.ref(match[1].trim()) else arg
    else
      arg

  prepareArgs: (args) ->
    _.map args, H.prepareArg

  create: (module, args, properties = undefined) ->
    create:
      module: module
      args: H.prepareArgs(args)
    properties: properties

  ##
  # Helper for bean: Helper.factory 'some-module', '=>ref1', 'concrete'
  factory: (module, argSpec...) ->
    H.create module, argSpec

module.exports = H
