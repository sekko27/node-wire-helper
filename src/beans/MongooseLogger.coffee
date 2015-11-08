util = require 'util'
module.exports = (logger, depth = 2) ->
  (collection, method, query, doc, options) ->
    logger.info 'mongoose', "#{collection}.#{method}(#{util.inspect(query, depth: depth)}) - #{util.inspect(doc, depth: depth)} [#{options}]"
