module.exports = {
    Helper: require('./lib/Helper'),
    Runner: require('./lib/Runner'),
    Loader: require('./lib/loader/CoCModuleLoader'),
    Aware: require('./lib/plugins/Aware'),
    beans: {
        ConfigurableFactory: require('./lib/beans/ConfigurableFactory')
    }
};
