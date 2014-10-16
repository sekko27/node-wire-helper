_ = require 'lodash'
root = require 'app-root-path'

LIB_PREFIX = process.env['LIB_PREFIX'] ? 'lib'

Helper =
  ########################################
  # Base path resolution
  lib: (tail) ->
    root.resolve "lib/#{tail}"
  domain: (tail) ->
    Helper.lib "domain/#{tail}"
  model: (name) ->
    Helper.domain "models/#{name}"
  Model: (name) ->
    Helper.model "#{name}Model"
  repository: (name) ->
    Helper.domain "repositories/#{name}"
  Repository: (name) ->
    Helper.repository "#{name}Repository"
  service: (name) ->
    Helper.domain "services/#{name}"
  Service: (name) ->
    Helper.service "#{name}Service"
  infrastructure: (tail) ->
    Helper.lib "infrastructure/#{tail}"
  persistence: (name) ->
    Helper.infrastructure "persistence/#{name}"
  log: (tail) ->
    Helper.infrastructure "log/#{tail}"
  i18n: (tail) ->
    Helper.infrastructure "i18n/#{tail}"
  web: (tail) ->
    Helper.lib "web/#{tail}"
  cli: (tail) ->
    Helper.lib "cli/#{tail}"

  ########################################
  # Use references easily
  ref: (name) ->
    $ref: name

  refs: (names) ->
    _.invoke names, Helper.ref

  ########################################
  # Bean creation utilities

module.exports = Helper
