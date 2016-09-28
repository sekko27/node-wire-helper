logger = (level) ->
  (args...) ->
    console.log "[Logger] - #{level}", args...

module.exports =
  warn: logger('WARNING')
  err: logger('ERROR')
  info: logger('INFO')
  debug: logger('DEBUG')

