###
# Wire-context-helper
###
_ = require 'lodash'
root = require 'app-root-path'

LIB_PREFIX = process.env['LIB_PREFIX'] ? 'lib'

class WireContextHelper
  ########################################

  lib: (tail) ->
    ###
    Library folder. It depends on the LIB_PREFIX
    environment variable. It's 'lib' by default.
    ###
    root.resolve "#{LIB_PREFIX}/#{tail}"

  domain: (tail) ->
    ###
    Domain root folder.
    ###
    WireContextHelper.lib "domain/#{tail}"

  model: (name) ->
    ###
    Folder for domain models (entities/value objects).
    ###
    WireContextHelper.domain "models/#{name}"

  Model: (name) ->
    ###
    Same as the 'model', but append 'Model' suffix
    to the model name.
    ###
    WireContextHelper.model "#{name}Model"

  repository: (name) ->
    ###
    Folder for repositors.
    ###
    WireContextHelper.domain "repositories/#{name}"

  Repository: (name) ->
    ###
    Same as the 'repository', but append 'Repository'
    suffix to the repository name automatically.
    ###
    WireContextHelper.repository "#{name}Repository"

  service: (name) ->
    WireContextHelper.domain "services/#{name}"
  Service: (name) ->
    WireContextHelper.service "#{name}Service"
  infrastructure: (tail) ->
    WireContextHelper.lib "infrastructure/#{tail}"
  persistence: (name) ->
    WireContextHelper.infrastructure "persistence/#{name}"
  log: (tail) ->
    WireContextHelper.infrastructure "log/#{tail}"
  i18n: (tail) ->
    WireContextHelper.infrastructure "i18n/#{tail}"
  web: (tail) ->
    WireContextHelper.lib "web/#{tail}"
  cli: (tail) ->
    WireContextHelper.lib "cli/#{tail}"

  ########################################
  # Use references easily
  ref: (name) ->
    $ref: name

  refs: (names) ->
    _.invoke names, WireContextHelper.ref

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

module.exports = new WireContextHelper
