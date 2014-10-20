module.exports = (winston, options = {}) ->
  (logger) ->
    level = process.env?['LOG_LEVEL'] ? options.level ? 'info'
    logger
      .add winston.transports['Console'],
        handleExceptions: (options.handleExceptions ? false) == true
        level: level
