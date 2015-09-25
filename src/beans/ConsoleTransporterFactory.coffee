_ = require 'lodash'

module.exports = (winston, options = {}) ->
  BASE_OPTIONS =
    level: 'info'
    colorize: true
    handleException: true

  (logger) ->
    logger
      .add winston.transports['Console'], _.assign({}, BASE_OPTIONS, options)
