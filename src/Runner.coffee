_ = require 'lodash'
wire = require 'wire'

module.exports = (spec, loader) ->
  plugin = module: "#{__dirname}/plugins/Sub"
  if _.has(spec, '$plugins') and _.isArray(spec['$plugins'])
    spec['$plugins'].push plugin
  else
    spec['$plugins'] = [ plugin ]

  loaderWrap = if loader
    (moduleId) -> loader.load(moduleId)

  wire(spec, require: loaderWrap).then(
    (context) ->
      numberOfBeans = _.keys(context).length
      if _.has context, 'logger'
        logger = context['logger']
        logger.info "Application initialized with #{numberOfBeans} beans"
        logger.info "You can see beans setting env.LOG_LEVEL to debug"
        logger.debug "Beans", _.keys context
      context
  )