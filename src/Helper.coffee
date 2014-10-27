_ = require 'lodash'
path = require 'path'

LIB_PREFIX = process.env['LIB_PREFIX'] ? 'lib'

# Calculate parent module (invoker) root path
# We assume, that we are in the node_modules/node-wire-context-helper
root = path.resolve "#{__dirname}/../../.."

WireContextHelper =
  lib: (tail) ->
    path.resolve "#{root}/#{LIB_PREFIX}/#{tail}"

  domain: (tail) ->
    WireContextHelper.lib "domain/#{tail}"

  model: (name) ->
    WireContextHelper.domain "models/#{name}"

  Model: (name) ->
    WireContextHelper.model "#{name}Model"

  repository: (name) ->
    WireContextHelper.domain "repositories/#{name}"

  Repository: (name = '') ->
    WireContextHelper.repository "#{name}Repository"

  service: (name) ->
    WireContextHelper.domain "services/#{name}"
  Service: (name) ->
    WireContextHelper.service "#{name}Service"
  infrastructure: (tail) ->
    WireContextHelper.lib "infrastructure/#{tail}"
  web: (tail) ->
    WireContextHelper.infrastructure "web/#{tail}"
  application: (tail) ->
    WireContextHelper.web tail
  applicationMiddleware: (tail) ->
    WireContextHelper.application "middlewares/#{tail}"
  ApplicationMiddleware: (tail) ->
    WireContextHelper.applicationMiddleware "#{tail}Middleware"
  applicationConfigurator: (tail) ->
    WireContextHelper.application "configurators/#{tail}"
  ApplicationConfigurator: (tail) ->
    WireContextHelper.applicationConfigurator "#{tail}Configurator"
  applicationFactory: (tail) ->
    WireContextHelper.application "factories/#{tail}"
  ApplicationFactory: (tail) ->
    WireContextHelper.applicationFactory "#{tail}Factory"
  controller: (tail) ->
    WireContextHelper.web "controllers/#{tail}"
  Controller: (tail) ->
    WireContextHelper.controller "#{tail}Controller"
  persistence: (name) ->
    WireContextHelper.infrastructure "persistence/#{name}"
  messaging: (name) ->
    WireContextHelper.infrastructure "messaging/#{name}"
  log: (tail) ->
    WireContextHelper.infrastructure "log/#{tail}"
  i18n: (tail) ->
    WireContextHelper.infrastructure "i18n/#{tail}"
  cli: (tail) ->
    WireContextHelper.infrastructure "cli/#{tail}"
  command: (tail) ->
    WireContextHelper.cli "commands/#{tail}"
  Command: (tail) ->
    WireContextHelper.command "#{tail}Command"
  view: (tail) ->
    WireContextHelper.path "views/#{tail}"
  View: (controller, action) ->
    WireContextHelper.view "#{controller}/#{action}"

  ########################################
  # Use references easily
  ref: (name) ->
    $ref: name

  refs: (names) ->
    _.map names, WireContextHelper.ref

  ########################################
  # Bean creation utilities
  bean: (mod, args, properties) ->
    create:
      module: mod
      args: args
    properties: properties

  env: (cases, def) ->
    if _.has cases, WireContextHelper.env()
      _.result cases, WireContextHelper.env()
    else
      def

module.exports = WireContextHelper
