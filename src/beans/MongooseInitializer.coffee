module.exports = (mongoose, debug = false) ->
  mongoose.set 'debug', debug
  mongoose

