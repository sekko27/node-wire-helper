module.exports = (logger) ->
  (collection, method, query, doc, options) ->
    logger.info "#{collection}.#{method}(#{query}) - #{doc} [#{options}]"
