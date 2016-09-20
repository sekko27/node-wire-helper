{EventEmitter} = require 'events'

class Connection extends EventEmitter

class Mongoose
  createConnection: (url, params) ->
    connection = new Connection()
    setImmediate -> connection.emit 'open'
    connection

module.exports = new Mongoose()
