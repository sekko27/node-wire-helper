_ = require 'lodash'

###
  You should define it within the context:
  connection:
    sub:
      module: 'wire-context-helper#beans.MongooseConnectionFactory
      args: [
        Ctx.ref 'winston'
        transporters: [...]
        exitOnError: true*|false
      ]
  Where
    * wire-context-helper - This module
    * winston - Name of the winston module, which is defined in the wire context already
###

module.exports = (winston, options = {}) ->
  logger = new (winston['Logger'])
    exitOnError: (options?.exitOnError == true)

  transporters = options['transporters'] ? []
  _.each transporters, (transporter) ->
    transporter(logger)

  logger


