# Goals

The module tries to 

* define basic folder structure for DDD-like projects 
* provide some shortcuts to these components available from wire context specifications

# Components

## CoCModuleLoader

CoCModuleLoader is a module loader for wire. It supports module definitions defined by the `(env#)?category:pathSpec` format. 
If the module is not defined in this format then the loader will fall-back to the default `require` module loader. 

For example passing the `lib#Model:Person` moduleId to the loader it tries to load module from `lib/domain/models/PersonModel` path (under one of the registered module root, see below).

The category loaders are pluggable into the loader.

### Instantiation

Wire-context-helper module exports the `CoCModuleLoader` as `Loader`:

```coffeescript
{Loader} = require 'wire-context-helper'
```

`CoCModuleLoader` has a `logger` member which is a DummyLoaderLogger instance by default (logging to console). If you want you can inject a custom logger which supports `warn`, `info` shortcuts:
 
```coffeescript
# By default the 'extensions' parameter is defined as ['.js', '.node', '.json'] (in this order).
# Loader will try to load modules with this extensions in this order.
extensions = ['.js']
loader = new Loader(extensions)
loader.logger = createLoggerInstanceSomehow() # For example log4js, winston, etc...
```

### Configuration

#### Module root registration

You can define module roots the loader tries to look for the modules under them. 
Loader tries to load files with .js, .node and .json extensions (by default, but you can override this with constructor parameter).

You can assign priority to the module roots: `lower` value means `higher priority`. Ie: loader will load files from module with lowest priority. Priority can be any number.
For example:
 
* register `/path/to/module-one` with priority `0`
* register `/path/to/module-two` with priority `1`
* `module-one` contains `lib/domain/models/A.node`
* `module-two` contains `lib/domain/models/A.js`
* `then` the loader will load `lib/domain/models/A.node` from `module-one`

Module loader supports registering one module root or multiple modules roots at once. It emit warning when no package.json exists in the module root.

```coffeescript
# Register one module root - returns Promise
loader.registerModuleRoot(absolutePathToModuleRoot, priority)
    .then -> # module root has been registered
    .catch (err) -> # unable to register module root
    
# Register multiple module root - return Promise 
loader.registerModuleRoots([
  {root: moduleRoot1, priority: priority1}
  {root: moduleRootN, priority: priorityN}
])
    .then -> # all module roots have been registered successfully
    .catch (err) -> # unable to register every module roots
```

You can also register modules as module root:

```coffeescript
loader.registerModule 'some-module', 1
```

#### Category plugin registration

You can also register category plugins, which resolve path for the modules. They handle the `category` part in the `(env#)?category:pathSpec` module definition. 

The signature of a category plugin method is:

```coffeescript
categoryPlugin = (env, pathSpec) ->
  # this is a CategoryPluginContext defined below
```

Category plugins will run in a specific context (this) which consists of

```coffeescript
CategoryPluginContext =
    # accessor over the registered plugins (map of plugins by their names)
    # You can access a specific one by @plugin('categoryPluginName') 
    plugin: (name) -> pluginsMap.get(name)
    
    # helper method which is looking for the file (defined by the module id) under different module roots using the configured extensions
    # For example, if you have '/module-one' with priority 0 and '/module-two' with priority 1 module roots have been registered and the extensions is configured by ['.js', '.node'], then
    # @findModule('relative-path-to-file') will stat
    #   - /module-one/relative-path-to-file.js
    #   - /module-one/relative-path-to-file.node
    #   - /module-two/relative-path-to-file.js
    #   - /module-two/relative-path-to-file.node
    # and returns a promise with the first existing one.
    findModule: (path) -> 
    
    # helper method used in plugins to recursively resolve path. 
    # For example model depends on domain, so this shortcut means: model = (env, pathSpec) = rec('domain', 'models', env, pathSpec)
    rec: (parent, key, env, pathSpec)
    
    # Helper to wrap a parameter into an array if it's not an array
    ensureArray: (a) -> 
```

`CoCModuleLoader` provides the `recPlugin(parent, key, suffix)` method you can use to register custom plugins based on existing one (as parent):

* `parent` - is the parent category plugin name
* `key` - path part appended to the path resolved by parent plugin
* `suffix` - suffix for the resolved path

```coffeescript
# it means:
# 'lib#customs:Some' will be resolved to 'lib#domain:' + '/' + customs + '/Some' + 'Custom' 
loader.registerCategoryPlugin 'customPluginKey', loader.recPlugin 'domain', 'customs', 'Custom'

# It also supports registering multiple plugins at once
loader.registerCategoryPlugin {
    customPlugin1: loader.recPlugin 'domain', 'custom1'
    customPlugin2: loader.recPlugin 'domain', 'custom2', 'X'
}
```

### Usage

You can use the loader to load modules defined by the `(env#)?category:pathSpec`:

```coffeescript
loader.load(moduleId)
    .then (mod) -> # Use the module
    .catch (err) -> # Unable to load the module
```

It will emit an info log when multiple module roots contains files with the resolved relative path.

## Runner

Module also exports a Wire runner:

```coffeescript
{Runner} = require 'wire-context-helper'
```

It has parameters:

* `spec` - wire spec
* `loader` - wire module loader (can be CoCModuleLoader)

The Runner adds the `sub` plugin to the spec which supports the bean definitions like

```coffeescript
referencedBean:
  module: 'someModule'
bean:
  sub:
    module: 'referencedBean#path.to.prop'
    factory: 'function'
    args: [ 1, 2 ]
```

This will use the `referencedBean` bean and extract a function defined by the `path.to.prop` path from the bean, and initializes using args.

`factory` can be:

* factory - use extracted member as function to create new instance
* module - use extracted member as is

A complete example for using the Runner is:

```coffeescript
path = require 'path'
{Loader, Runner} = require 'wire-context-helper'
logger = initializeLogger()

loader = new Loader(['.js', '.node'])
loader.logger = logger

# Register module roots
loader.registerModuleRoot '.', 0
loader.registerModule 'some-other-module', 1

spec = require 'path-to-context-spec'
Runner(spec, loader).then (ctx) ->
  # Use the spec
```

## Helper

Module also exports a utility helper as `Helper`.

|Method|Description|
|------|:----------|
|`Helper.ref(name)`|Shortcut for `{$ref: name}`|
|`Helper.refs(names)`|Create array of references: `Helper.ref ['a', 'b']` means `[{$ref: 'a'}, {$ref: 'b'}]`|
|`Helper.environment()`|Resolve `NODE_ENV` environment variable. Default to `production`.|
|`Helper.env(cases)`|Switch case for environment cases, i.e: cases parameter is an object literal with environment keys and related values. For example: `Helper.env({production:0, development:1, default: 2})` will evaluates 0 for production, 1 for development NODE_ENV or 2 for other environment setting.|
|`Helper.envVar(name, def)`|Returns environment variable value if exists or the def parameter.|
|`Helper.factory(moduleSpec, argSpec...)`|Short cut for factory definition. It supports the `=>ref` syntax for arguments. So, `bean: Helper.factory 'lib#Model:Factory', '=>driver', {level: 'INFO'}` means `bean: {create: {module: 'lib#Factory:Person', args: [ {$ref: 'driver'}, {level: 'INFO'} ] }}`|
# Project structure

Following category plugins are registered by default:

* **MODULE_ROOT**  - A registered module root.
  * **ENV** - Environment has been optionally defined in module id. Default to `lib`
    * `domain` - Contains domain.
        * `models` - Entities and value objects.
        * `repositories` - Model repositories.
        * `services` - Services.
        * `factories` - Factories.
    * `infrastructure` - Contains infrastructural implementations.
        * `cli` - Command line utilities.
            * `commands` - Command implementations.
        * `i18n` - Internatialization framework.
        * `factories` - Infrastructure factories 
        * `log` - Logger frameworks.
        * `persistence` - Persistence implementations (mongo, etc)
        * `messaging` - Messaging implementations.
        * `web` - Web service layer.
            * `configurators` - Web framework configurators.
            * `controllers` - Controllers.
            * `factories` - Wire factories for web components.
            * `middlewares` - Web framework middlewares.


# TODOS

* Use wire instantiation in Sub plugin
* Create shortcut for Runner using loader (with registered module root, etc)
