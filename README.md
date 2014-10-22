# Goals

The module tries to define basic folder structure for DDD-like projects and to provide some shortcut for
build wire contexts.
It try to detect the direct parent (invoker) root path and resolve path relative to that.

## Develop wire-context-helper

It's a coffee-script project, so you need to compile it into javascripts. Package.json contains prepublish and 
postinstall scripts which automates these processes, but meanwhile development you should compile sources automatically.
You can do that:

* Configure your IDE to compile coffeescripts under src to the lib folder.
* Run the watcher: coffee -cw -o lib src

## Best practices

* Follow the project structure
* If you define class bean you should use properties over constructor arguments.
* Use the shortcuts if possible
* Try to not use require in your sources, use injection instead.
* Never create documentation/diagrams/etc under the project, use Wiki.

# DDD project structure

The basic project structure:

* **build** - Build folder.
* **context** - Context configurations.
* **locales** - Locale files for i18n.
* **public** - Public sources (js/css/etc).
    * **scripts** - Javascript sources.
        * **lib** - Third party libraries.
        * **models** - Client side models.
        * **routers** - Router definitions.
        * **template-views** - Client side template views.
        * **views** - View sources.
        * **template.js** - Compiled templates.
        * **XXX.js** - Compiled requirejs entry point.
    * **styles** - Stylesheets.
    * **images** - Images.
* **LIB_PREFIX**  - The root of the library/module sources. If the LIB_PREFIX env variable is not defined then use 'lib' by default.
You may want to use different prefix (for example src) if you want to compile (coffee) or instruments (coverage) the sources.
    * **domain** - Contains domain model.
        * **models** - Entities and value objects.
        * **repositories** - Model repositories.
        * **services** - Services.
    * **infrastructure** - Contains infrastructural implementations.
        * **log** - Logger frameworks.
        * **persistence** - Persistence implementations (mongo, etc)
        * **i18n** - Internatialization framework.
    * **cli** - Command line utilities.
        * **commands** - Command implementations.
    * **web** - Web service layer.
        * **controllers** - Controllers.
        * **routers** - Routers.
* **logs** - If you use file-based logs and you have no rights to stream them into system log files, use this folder for that.
* **tests** - Test sources. Try to follow the **LIB_PREFIX** structure.
    **seeds** - Data providers for tests.
    **LIB_PREFIX** - Test cases/suites.
* **views** - Server side views (jade, etc).        
* **.bowerrc** - Bower configuration, at least the directory should point to the public/scripts/lib folder (3rd party libs).

# CoC

As you can see, you have to configure almost nothing, you should follow conventions.
