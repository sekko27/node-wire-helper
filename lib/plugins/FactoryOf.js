const _ = require('lodash');
const Utils = require('./Utils');

module.exports =  function() {
    return {
        factories: {
            factoryOf: function (resolver, componentDefinition, wire) {
                const options = componentDefinition.options;
                const instance = Utils.getPromise(wire)
                    .then((Promise) => {
                        return Promise.props({
                            cls: wire.loadModule(options.module),
                            args: wire(options.args),
                            Promise: Promise,
                            logger: Utils.getLogger(wire)
                        })
                    })
                    .then(({cls, args, Promise, logger}) => {
                        const instance = new cls(...args);
                        return Utils.applyAwares(wire, instance, Promise, logger);
                    });
                resolver.resolve(instance);
            }
        }
    }
};

