_ = require 'lodash'
wire = require 'wire'
util = require 'util'

module.exports = (spec, callback) ->
  plugin = module: "#{__dirname}/plugins/helper"
  if _.has(spec, '$plugins') and _.isArray(spec['$plugins'])
    spec['$plugins'].push plugin
  else
    spec['$plugins'] = [ plugin ]

  wire(spec).then(
    (context) ->
      numberOfBeans = _.keys(context).length
      if _.has context, 'logger'
        logger = context['logger']
        logger.info "Application initialized with #{numberOfBeans} beans"
        logger.info "You can see beans setting env.LOG_LEVEL to debug"
        logger.debug "Beans", _.keys context
      callback null, context
    (err) ->
      console.error util.inspect(err, depth: null, showHidden: true), err.stack
      callback err
  )