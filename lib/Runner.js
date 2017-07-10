const _     = require('lodash');
const wire  = require('wire');
const Utils = require('./Utils');

module.exports = function(spec, loader) {
    const start = process.hrtime();

    const subPlugin = {
        module: `${__dirname}/plugins/Sub`
    };
    const factoryOfPlugin = {
        module: `${__dirname}/plugins/FactoryOf`
    };
    const factoryOfFactoryPlugin = {
        module: `${__dirname}/plugins/FactoryOfFactory`
    };

    const wrapper = loader
        ? function(moduleId) {return loader.load(moduleId);}
        : undefined;

    Utils.addToArrayProperty(spec, '$plugins', subPlugin);
    Utils.addToArrayProperty(spec, '$plugins', factoryOfPlugin);
    Utils.addToArrayProperty(spec, '$plugins', factoryOfFactoryPlugin);

    //noinspection JSUnresolvedFunction
    return wire(spec, {require: wrapper})
        .then((context) => {
            const keys = _.keys(context);
            if (_.has(context, 'logger')) {
                const logger = context.logger;
                const bootstrapTime = process.hrtime(start);
                logger.info(`Application has been initialized and contains ${keys.length} beans within ${bootstrapTime} seconds`);
                logger.info(`You can see bean details if you set the LOG_LEVEL environment variable to debug`);
                logger.debug(`Beans: ${keys}`);
            }
            return context;
        });
};
