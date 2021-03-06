const _ = require('lodash');
const Utils = require('./Utils');

module.exports =  function() {
    return {
        factories: {
            factoryOfFactory: function (resolver, componentDefinition, wire) {
                const options = componentDefinition.options;
                const instance = Utils.getPromise(wire)
                    .then((Promise) => {
                        return Promise.props({
                            cls: wire.loadModule(options.module),
                            args: wire(options.args)
                        })
                    })
                    .then(({cls, args}) => {
                        return () => new cls(...args);
                    });
                resolver.resolve(instance);
            }
        }
    }
};

