_ = require 'lodash'
root = require 'app-root-path'

LIB_PREFIX = process.env['LIB_PREFIX'] ? 'lib'

class WireContextHelper
  lib: (tail) ->
    root.resolve "#{LIB_PREFIX}/#{tail}"

  domain: (tail) ->
    WireContextHelper.lib "domain/#{tail}"

  model: (name) ->
    WireContextHelper.domain "models/#{name}"

  Model: (name) ->
    WireContextHelper.model "#{name}Model"

  repository: (name) ->
    WireContextHelper.domain "repositories/#{name}"

  Repository: (name) ->
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
