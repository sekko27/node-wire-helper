# Goals

The module tries to 

* define basic folder structure for DDD-like projects 
* provide some shortcuts to these components available from wire context specifications

# Components

## CoCModuleLoader

CoCModuleLoader is a module loader for wire. It supports module definitions defined by the __(env#)?category:pathSpec__ format. 
If the module is not defined in this format then the loader will fall-back to the default __require__ module loader. 

For example passing the __lib#Model:Person__ moduleId to the loader it tries to load module from __lib/domain/models/PersonModel__ path (under one of the registered module root, see below).

The category loaders are pluggable into the loader.

### Instantiation

Wire-context-helper module exports the __CoCModuleLoader__ as __Loader__:

```coffeescript
{Loader} = require 'wire-context-helper'
```

__CoCModuleLoader__ has a __logger__ member which is a DummyLoaderLogger instance by default (logging to console). If you want you can inject a custom logger which supports __warn__, __info__ shortcuts:
 
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

You can assign priority to the module roots: __lower__ value means __higher priority__. Ie: loader will load files from module with lowest priority. Priority can be any number.
For example:
 
* register __/path/to/module-one__ with priority __0__
* register __/path/to/module-two__ with priority __1__
* __module-one__ contains __lib/domain/models/A.node__
* __module-two__ contains __lib/domain/models/A.js__
* __then__ the loader will load __lib/domain/models/A.node__ from __module-one__

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

You can also register category plugins, which resolve path for the modules. They handle the __category__ part in the __(env#)?category:pathSpec__ module definition. 

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

__CoCModuleLoader__ provides the __recPlugin(parent, key, suffix)__ method you can use to register custom plugins based on existing one (as parent):

* __parent__ - is the parent category plugin name
* __key__ - path part appended to the path resolved by parent plugin
* __suffix__ - suffix for the resolved path

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

You can use the loader to load modules defined by the __(env#)?category:pathSpec__:

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

* __spec__ - wire spec
* __loader__ - wire module loader (can be CoCModuleLoader)

The Runner adds the __sub__ plugin to the spec which supports the bean definitions like

```coffeescript
referencedBean:
  module: 'someModule'
bean:
  sub:
    module: 'referencedBean#path.to.prop'
    factory: 'function'
    args: [ 1, 2 ]
```

This will use the __referencedBean__ bean and extract a function defined by the __path.to.prop__ path from the bean, and initializes using args.

__factory__ can be:

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

Module also exports a utility helper as __Helper__.

#### Helper.ref(name)

Shortcut for __{$ref: name}__

#### Helper.refs(names)

Create array of references: 

```coffeescript
Helper.ref(['a', 'b']) 
# Same as
[{$ref: 'a'}, {$ref: 'b'}]
```

#### Helper.environment()

Resolve __NODE_ENV__ environment variable. Default to __production__

#### Helper.env(cases)

Switch case for environment cases, i.e: cases parameter is an object literal with environment keys and related values. 

For example: 

```coffeescript
Helper.env {
    production: 0
    development: 1
    default: 2
}
``` 

will evaluates 0 for production, 1 for development NODE_ENV or 2 for other environment setting.

#### Helper.envVar(name, def)

Returns environment variable value if exists or the def parameter.

#### Helper.factory(moduleSpec, argSpec...)

Shortcut for factory definition. It supports the __=>ref__ syntax for arguments. 

So

```coffeescript
bean: Helper.factory 'lib#Model:Factory', '=>driver', {level: 'INFO'}
``` 

means 

```coffeescript
bean: 
    create: 
        module: 'lib#Factory:Person'
        args: [ 
            {$ref: 'driver'}
            {level: 'INFO'} 
        ]
```

# Project structure

Following category plugins are registered by default:

* **MODULE_ROOT**  - A registered module root.
  * **ENV** - Environment has been optionally defined in module id. Default to __lib__
    * __domain__ - Contains domain.
        * __models__ - Entities and value objects.
        * __repositories__ - Model repositories.
        * __services__ - Services.
        * __factories__ - Factories.
    * __infrastructure__ - Contains infrastructural implementations.
        * __cli__ - Command line utilities.
            * __commands__ - Command implementations.
        * __i18n__ - Internatialization framework.
        * __factories__ - Infrastructure factories 
        * __log__ - Logger frameworks.
        * __persistence__ - Persistence implementations (mongo, etc)
        * __messaging__ - Messaging implementations.
        * __web__ - Web service layer.
            * __configurators__ - Web framework configurators.
            * __controllers__ - Controllers.
            * __factories__ - Wire factories for web components.
            * __middlewares__ - Web framework middlewares.


# TODOS

* Use wire instantiation in Sub plugin
* Create shortcut for Runner using loader (with registered module root, etc)
