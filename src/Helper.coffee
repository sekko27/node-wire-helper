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

module.export = H
