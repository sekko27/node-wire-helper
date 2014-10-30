_ = require 'lodash'
path = require 'path'

# Calculate parent module (invoker) root path
# We assume, that we are in the node_modules/node-wire-context-helper
root = path.resolve "#{__dirname}/../../.."

instances = {}

module.exports = (prefix = "lib") ->
  return instances[prefix] if _.has instances, prefix

  instances[prefix] = H =
    path: (tail) ->
      path.resolve "#{root}/#{tail}"

    lib: (tail) ->
      path.resolve "#{root}/#{prefix}/#{tail}"

    domain: (tail) ->
      H.lib "domain/#{tail}"

    model: (name) ->
      H.domain "models/#{name}"

    Model: (name) ->
      H.model "#{name}Model"

    repository: (name) ->
      H.domain "repositories/#{name}"

    Repository: (name = '') ->
      H.repository "#{name}Repository"

    service: (name) ->
      H.domain "services/#{name}"
    Service: (name) ->
      H.service "#{name}Service"
    infrastructure: (tail) ->
      H.lib "infrastructure/#{tail}"
    web: (tail) ->
      H.infrastructure "web/#{tail}"
    application: (tail) ->
      H.web tail
    applicationMiddleware: (tail) ->
      H.application "middlewares/#{tail}"
    ApplicationMiddleware: (tail) ->
      H.applicationMiddleware "#{tail}Middleware"
    applicationConfigurator: (tail) ->
      H.application "configurators/#{tail}"
    ApplicationConfigurator: (tail) ->
      H.applicationConfigurator "#{tail}Configurator"
    applicationFactory: (tail) ->
      H.application "factories/#{tail}"
    ApplicationFactory: (tail) ->
      H.applicationFactory "#{tail}Factory"
    controller: (tail) ->
      H.web "controllers/#{tail}"
    Controller: (tail) ->
      H.controller "#{tail}Controller"
    persistence: (name) ->
      H.infrastructure "persistence/#{name}"
    messaging: (name) ->
      H.infrastructure "messaging/#{name}"
    log: (tail) ->
      H.infrastructure "log/#{tail}"
    i18n: (tail) ->
      H.infrastructure "i18n/#{tail}"
    cli: (tail) ->
      H.infrastructure "cli/#{tail}"
    command: (tail) ->
      H.cli "commands/#{tail}"
    Command: (tail) ->
      H.command "#{tail}Command"
    view: (tail) ->
      path.resolve "#{root}/views/#{tail}/"
    View: (controller, action, ext = ".html") ->
      H.view "#{controller}/#{action}#{ext}"
    util: (tail) ->
      H.lib "utils/#{tail}"
    context: (tail) ->
      H.lib "contexts/#{tail}"

    ########################################
    # Use references easily
    ref: (name) ->
      $ref: name

    refs: (names) ->
      _.map names, H.ref

    ########################################
    # Bean creation utilities
    bean: (mod, args, properties) ->
      create:
        module: mod
        args: args
      properties: properties

    environment: ->
      process.env['NODE_ENV'] ? 'production'

    env: (cases, def) ->
      if _.has cases, H.environment()
        _.result cases, H.environment()
      else
        def
