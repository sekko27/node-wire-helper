module.exports = {
    Helper: require('./lib/Helper'),
    Runner: require('./lib/Runner'),
    Loader: require('./lib/loader/CoCModuleLoader'),
    beans: {
        ConfigurableFactory: require('./lib/beans/ConfigurableFactory')
    }
};
