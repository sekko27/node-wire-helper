_ = require 'lodash'
path = require 'path'
Promise = require 'bluebird'
stat = Promise.promisify(require('fs').stat)
pathModule = require 'path'

DEFAULT_EXTENSIONS = ['.js', '.node', '.json']

findFileByExtension = (root, path, extensions) ->
  Promise.any _.map extensions, (ext) ->
    p = pathModule.join(root, "#{path}#{ext}")
    stat(p)
      .then (s) -> if s.isFile() then Promise.resolve(s) else Promise.reject()

fileFilter = (path, extensions) ->
  ({root}) ->
    findFileByExtension(root, path, extensions)
      .then -> true
      .catch -> false

class CoCModuleLoader
  # @Inject logger

  constructor: (@extensions = DEFAULT_EXTENSIONS) ->
    @moduleRoots = []
    @categoryPlugins = new Map()
    @initPluginContext()
    @initBasePlugins()

  initPluginContext: ->
    @pluginContext =
      plugins: @categoryPlugins
      findModule: (path) =>
        Promise.filter(@moduleRoots, fileFilter(path, @extensions)).then (validRoots) =>
          if validRoots.length == 0
            roots = _.map(@moduleRoots, (r) -> r.root).join(", ")
            Promise.reject("No valid roots for #{path} in roots: #{roots}")
          else
            roots = _.map validRoots, 'root'
            if validRoots.length > 1
              @logger.info "More than one (#{roots.length}) valid roots have been found for #{path} (choosing the first): #{roots.join(',')}"
            Promise.resolve(pathModule.join(roots[0], path))
      ensureArray: (a) ->
        if _.isArray(a) then a else [a]

  initBasePlugins: ->
    @registerCategoryPlugins {
      resolve: (env = "lib", pathSpec) ->
        @findModule [env].concat(@ensureArray(pathSpec)).join pathModule.sep
      domain: (env, pathSpec) ->
        @plugins.get('resolve')(env, ["domain"].concat(@ensureArray(pathSpec)))
      model: (env, pathSpec) ->
        @plugins.get('domain')(env, ["models"].concat(@ensureArray(pathSpec)))
    }

  registerModuleRoot: (root, priority = 0) ->
    packagePath = path.join(root, "package.json")
    #noinspection JSUnresolvedVariable
    stat(packagePath)
      .catch =>
        @logger.warn "No package.json found in module root: #{root}"
      .finally =>
        @moduleRoots.push {root: root, priority: priority}
        @moduleRoots = _.sortBy @moduleRoots, 'priority'

  registerCategoryPlugins: (plugins) ->
    _.each plugins, (plugin, category) => @registerCategoryPlugin category, plugin

  registerCategoryPlugin: (category, plugin) ->
    if @categoryPlugins.has category
      @logger.warn "Overriding category plugin: #{category}"
    @categoryPlugins.set category, _.bind plugin, @pluginContext

  load: (moduleId) ->
    match = moduleId.match /^(([^#]+)#)?([^:]+):(.*)$/
    if match
      loader = match[3]
      if not @categoryPlugins.has(loader)
        Promise.reject("Category plugin does not exists: #{loader}")
      else
        environment = match[2]
        pathSpec = match[4]
        @categoryPlugins.get(loader)(environment, pathSpec)
          .then (modulePath) -> Promise.resolve(require(modulePath))
    else
      Promise.resolve(require(moduleId))

module.exports = CoCModuleLoader

