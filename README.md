# Goals

The module tries to 

* define basic folder structure for DDD-like projects 
* provide some shortcuts to these components available from wire context specifications

## Components

### CoCModuleLoader

CoCModuleLoader is a module loader for wire. It supports module definitions by the `(env#)?category:pathSpec` format. If the module is not defined in this format then the loader will fall-back to the default `require` module loader. 

For example passing the `lib#Model:Person` moduleId to the loader it tries to load module from `lib/domain/models/PersonModel` path (under one of the registered module root).

The category loaders are pluggable into the loader.

#### Instantiation

Wire-context-helper module exports the class as `CoCModuleLoader`:

```coffeescript
{CoCModuleLoader} = require 'wire-context-helper'
```

`CoCModuleLoader` requires a logger instance with `warn`, `info` shortcuts:
 
```coffeescript
# By default extensions parameter is defined as ['.js', '.node', '.json'] (in this order).
# Loader will try to load modules with this extensions in this order.
extensions = ['.js']
loader = new CoCModuleLoader(extensions)
loader.logger = createLoggerInstanceSomehow() # For example log4js, winston, etc...
```

#### Configuration

You can define module root the loader tries to look for the modules under them. Loader tries to load files with .js, .node and .json extensions (by default, but you can override this with constructor parameter).

You can assign priority to the module roots: lower value means higher priority. Ie: loader will load files from module with lowest priority.

Module loader supports registering one module or multiple modules at once. It emit warning when no package.json exists in the module root.

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

You can also register category plugins, which resolve path for the modules. It will run in context (this):

```coffeescript
CategoryPluginContext = 
    plugins: {} # registered plugins
    findModule: (path) -> # helper method which is looking for existing file with extensions passed at construction time, return Promise of first path exists
    rec: (parent, key, env, pathSpec) -> # Recursive evaluation helper, shortcut for @plugins.get(parent)(env, [key].concat(@ensureArray(pathSpec)))
    ensureArray: (a) -> # Helper to wrap a parameter into an array if it's not an array
```

`CoCModuleLoader` provides the `recPlugin(parent, key, suffix)` method you can use to register custom plugins:

```coffeescript
loader.registerCategoryPlugin 'customPluginKey', loader.recPlugin 'domain', 'customs', 'Custom'

# It also supports registering multiple plugins at once
loader.registerCategoryPlugin {
    customPlugin1: loader.recPlugin 'domain', 'custom1'
    customPlugin2: loader.recPlugin 'domain', 'custom2', 'X'
}
```

## Project structure

* **LIB_PREFIX**  - The root of the library/module sources. If the LIB_PREFIX env variable is not defined then use 'lib' by default.
You may want to use different prefix (for example src) if you want to compile (coffee) or instruments (coverage) the sources.
    * **domain** - Contains domain model.
        * **models** - Entities and value objects.
        * **repositories** - Model repositories.
        * **services** - Services.
    * **infrastructure** - Contains infrastructural implementations.
        * **cli** - Command line utilities.
            * **commands** - Command implementations.
        * **i18n** - Internatialization framework.
        * **log** - Logger frameworks.
        * **persistence** - Persistence implementations (mongo, etc)
        * **messaging** - Messaging implementations.
        * **web** - Web service layer.
            * **configurators** - Web framework configurators.
            * **controllers** - Controllers.
            * **factories** - Wire factories for web components.
            * **middlewares** - Web framework middlewares.
            * **routers** - Routers.
* **logs** - If you use file-based logs and you have no rights to stream them into system log files, use this folder for that.
* **src** - Coffee sources compiled into LIB_PREFIX folder (use prepublish).
* **tests** - Tests. Try to follow the **LIB_PREFIX** structure.
    **seeds** - Data providers for tests.
    **LIB_PREFIX** - Test cases/suites.
* **tests-src** - Test coffee sources compiled into tests folder.
* **views** - Server side views (jade, etc).
* **.bowerrc** - Bower configuration, at least the directory should point to the public/scripts/lib folder (3rd party libs).
* **package.json** - Module description.

# Usages

In wire contexts:

```javascript
var wch = require 'wire-context-helper';
var Helper = wch.Helper('lib');

module.exports = {
    bean: {
        create: {
            module: Helper.model('Person')
        }
    }
};
```

You can use module provided factories:

* ConfigurableFactory
* MongooseConnectionFactory
* WinstonLoggerFactory
* ConsoleTransporterFactory

To use them, you should define module in your wire and reference to them using the sub component factory plugin 
(factories exist in the beans nested object):

```javascript
var wch = require 'wire-context-helper';
var Helper = wch.Helper('lib');

module.exports = {
    helper: {
        module: 'wire-context-helper',
    },
    express: {
        create: {
            module: 'express',
            args: []
        }
    },            
    app: {
        sub: {
            module: 'helper#beans.ConfigurableFactory',
            args: [
                Helper.ref('express'),
                Helper.refs([
                    // ..configurators
                ])
            ]
        }
    }
}
```

To initialize wire context:

```javascript
var wire = require('wire');
var wch = require('wire-context-helper');

spec = require('path/to/context/spec');
wch.Runner(spec, function(err, context) {
    // wired
});
```

# CoC

As you can see, you have to configure almost nothing, you should follow conventions.
