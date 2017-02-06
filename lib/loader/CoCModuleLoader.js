const _                 = require('lodash');
const Promise           = require('bluebird');
const pathModule        = require('path');
const DummyLoaderLogger = require('./DummyLoaderLogger');
const Utils             = require('./../Utils');

const DEFAULT_OPTIONS = {
    extensions: ['.js', '.node', '.json'],
    Promise: Promise,
    logger: new DummyLoaderLogger()
};

class CoCModuleLoader {
    constructor(customOptions) {
        const options = _.defaults({}, customOptions, DEFAULT_OPTIONS);
        this.extensions = options.extensions;
        this.logger = options.logger;
        this.Promise = options.Promise;

        this.moduleRoots = [];
        this.categoryPlugins = new Map();

        this.initPluginContext();
        this.initBasePlugins();
    }

    initPluginContext() {
        this.pluginContext = {
            plugin: (name) => {
                return this.categoryPlugins.get(name);
            },
            findModule: (path) => {
                const filter = this.fileFilter(path, this.extensions);
                return this.Promise.filter(this.moduleRoots, filter).then((validRoots) => {
                    const roots = _.map(validRoots, 'root');
                    if (roots.length == 0) {
                        return this.Promise.reject(`No valid roots for ${path} in roots: ${roots.join(', ')}`);
                    } else {
                        if (roots.length > 1) {
                            this.logger.info(`More than one (${validRoots.length}) valid roots have been found for ${path} (choosing the first): ${roots[0]} of ${roots.join(', ')}`);
                        }
                        return this.Promise.resolve(pathModule.join(roots[0], path))
                    }
                });
            },
            rec: (parent, key, env, pathSpec) => {
                return this.pluginContext.plugin(parent)(env, [key].concat(Utils.ensureArray(pathSpec)));
            }
        };
    }

    initBasePlugins() {
        this.registerCategoryPlugins({
            resolve: function(env = 'lib', pathSpec) {
                return this.findModule([env].concat(Utils.ensureArray(pathSpec)).join(pathModule.sep));
            },
            domain:                   CoCModuleLoader.recPlugin('resolve', 'domain'),
            configuration:            CoCModuleLoader.recPlugin('resolve', 'configuration'),
            model:                    CoCModuleLoader.recPlugin('domain', 'models'),
            Model:                    CoCModuleLoader.recPlugin('domain', 'models', 'Model'),
            factory:                  CoCModuleLoader.recPlugin('domain', 'factories'),
            Factory:                  CoCModuleLoader.recPlugin('domain', 'factories', 'Factory'),
            infrastructure:           CoCModuleLoader.recPlugin('resolve', 'infrastructure'),
            infrastructureFactory:    CoCModuleLoader.recPlugin('infrastructure', 'factories'),
            InfrastructureFactory:    CoCModuleLoader.recPlugin('infrastructure', 'factories', 'Factory'),
            repository:               CoCModuleLoader.recPlugin('domain', 'repositories'),
            Repository:               CoCModuleLoader.recPlugin('domain', 'repositories', 'Repository'),
            service:                  CoCModuleLoader.recPlugin('domain', 'services'),
            Service:                  CoCModuleLoader.recPlugin('domain', 'services', 'Service'),
            web:                      CoCModuleLoader.recPlugin('infrastructure', 'web'),
            application:              CoCModuleLoader.recPlugin('infrastructure', 'web'),
            applicationMiddleware:    CoCModuleLoader.recPlugin('web', 'middlewares'),
            ApplicationMiddleware:    CoCModuleLoader.recPlugin('web', 'middlewares','Middleware'),
            applicationConfigurator:  CoCModuleLoader.recPlugin('web', 'configurators'),
            ApplicationConfigurator:  CoCModuleLoader.recPlugin('web', 'configurators', 'Configurator'),
            applicationFactory:       CoCModuleLoader.recPlugin('web', 'factories'),
            ApplicationFactory:       CoCModuleLoader.recPlugin('web', 'factories', 'Factory'),
            controller:               CoCModuleLoader.recPlugin('web', 'controllers'),
            Controller:               CoCModuleLoader.recPlugin('web', 'controllers', 'Controller'),
            persistence:              CoCModuleLoader.recPlugin('infrastructure', 'persistence'),
            messaging:                CoCModuleLoader.recPlugin('infrastructure', 'messaging'),
            log:                      CoCModuleLoader.recPlugin('infrastructure', 'log'),
            i18n:                     CoCModuleLoader.recPlugin('infrastructure', 'i18n'),
            cli:                      CoCModuleLoader.recPlugin('infrastructure', 'cli'),
            command:                  CoCModuleLoader.recPlugin('cli', 'commands'),
            Command:                  CoCModuleLoader.recPlugin('cli', 'commands', 'Command'),
            util:                     CoCModuleLoader.recPlugin('resolve', 'utils'),
            context:                  CoCModuleLoader.recPlugin('resolve', 'contexts')
        });
    }

    resortModuleRoots() {
        this.moduleRoots = _.sortBy(this.moduleRoots, 'priority');
        return this;
    }

    registerModuleRoots(roots) {
        return this.Promise.each(roots, ({root, priority}) => {
            return this.registerModuleRoot(root, priority, false);
        })
            .then(() => {
                return this.resortModuleRoots();
            });
    }

    registerModuleRoot(root, priority = 0, resort = true) {
        const packagePath = pathModule.join(root, 'package.json');
        return Utils.fileExists(packagePath)
            .then(() => {
                return this;
            })
            .catch(() => {
                this.logger.warn(`No package.json has been found in module root: ${root}`);
            })
            .finally(() => {
                this.moduleRoots.push({root: root, priority: priority});
                if (resort) {
                    this.resortModuleRoots();
                }
                return this;
            });
    }

    registerModules(modules) {
        return this.Promise.each(modules, ({module, priority}) => {
            return this.registerModuleRoot(CoCModuleLoader.moduleToRoot(module), priority, false);
        })
            .then(() => {
                return this.resortModuleRoots();
            });
    }

    registerModule(module, priority = 0) {
        return this.registerModuleRoot(CoCModuleLoader.moduleToRoot(module), priority, true);
    }

    registerCategoryPlugins(plugins) {
        return _.each(plugins, (plugin, category) => {
            this.registerCategoryPlugin(category, plugin);
        });
    }

    registerCategoryPlugin(category, plugin) {
        if (this.categoryPlugins.has(category)) {
            this.logger.warn(`Overriding category plugin: ${category}`);
        }
        this.categoryPlugins.set(category, _.bind(plugin, this.pluginContext));
    }

    load(moduleId) {
        const match = moduleId.match(/^(([^#]*)#)?([^:]{2,}):(.*)$/);
        if (match) {
            const loader = match[3];
            if (!this.categoryPlugins.has(loader)) {
                return this.Promise.reject(`Category plugin does not exists: ${loader}`);
            }
            const environment = match[2];
            const pathSpec = match[4];
            return this.categoryPlugins.get(loader)(environment, pathSpec)
                .then((modulePath) => {
                    return this.Promise.resolve(require(modulePath))
                });
        }
        else {
            console.log(moduleId);
            return this.Promise.resolve(require(moduleId));
        }
    }

    static moduleToRoot(module) {
        return pathModule.dirname(require.resolve(module));
    }

    /**
     * Find existing path constructed from {root}/{path}{ext}.
     *
     * @param {string} root Root part of the path.
     * @param {string} path Relative path part (to the root).
     * @param {Array.<string>} extensions Acceptable extensions.
     * @return {Promise} It's rejected if no valid path has been found.
     */
    findFileByExtension(root, path, extensions) {
        return this.Promise.any(_.map(extensions, (ext) => {
            return Utils.fileExists(pathModule.join(root, `${path}${ext}`));
        }));
    }

    /**
     * Create filter function which filters roots by whether the {root}/{path}{ext} is existing path.
     *
     * @param {string} path Relative path part (to the root).
     * @param {Array.<string>} extensions Acceptable extensions.
     * @returns {Function.<Boolean>} Filter function accepts the root part of the path.
     */
    fileFilter(path, extensions) {
        return ({root}) => {
            return this.findFileByExtension(root, path, extensions)
                .then(() => true)
                .catch(() => false);
        }
    }

    static recPlugin(parent, key, suffix = "") {
        return function(env, pathSpec) {
            if (_.isString(suffix) && (suffix !== "") && _.isString(pathSpec)) {
                pathSpec += suffix;
            }
            return this.rec(parent, key, env, pathSpec);
        };
    }
}

module.exports = CoCModuleLoader;

