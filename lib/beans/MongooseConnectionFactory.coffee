q = require 'q'

module.exports = (mongoose, settings) ->
  defer = q.defer()
  url = settings['connection'].url
  options = settings['connection'].options || {}
  connection = mongoose.createConnection url, options
  connection.on 'error', (err) ->
    defer.reject(err)
  connection.once 'open', ->
    defer.resolve(connection)
  defer.promise
