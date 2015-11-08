q = require 'q'

###
  You should define it within the context:
  connection:
    sub:
      module: 'wire-context-helper#beans.MongooseConnectionFactory
      args: [
        Ctx.ref 'mongoose'
        connection:
          url: 'mongodb://localhost/db'
      ]
  Where
    * wire-context-helper - This module
    * mongoose - Name of the mongoose module, which is defined in the wire context already
###

module.exports = (mongoose, settings) ->
  defer = q.defer()
  connectionSettings = settings.connection
  url = connectionSettings.url
  options = connectionSettings.options || {}
  connection = mongoose.createConnection url, options

  connection.on   'error', (err) -> defer.reject(err)
  connection.once 'open',        -> defer.resolve(connection)

  defer.promise
