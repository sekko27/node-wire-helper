const _ = require('lodash');
const Utils = require('./Utils');

module.exports =  function() {
    return {
        factories: {
            sub: function (resolver, componentDefinition, wire) {
                const options = componentDefinition.options;
                const componentModule = options.module;
                const args = _.isArray(options.args) ? wire(options.args) : [];
                const match = componentModule.match(/^([^#]+)#(.*)$/);
                if (!match) {
                    return resolver.reject(`Sub component invalid module specification: ${componentModule}`);
                }
                const [ ,ref, path] = match;
                Utils.getPromise(wire)
                    .then((Promise) => {
                        const instance = Promise.join(wire({$ref: ref}), args).spread(function(referencedModule, resolvedArgs) {
                            if (!_.hasIn(referencedModule, path)) {
                                return Promise.reject(`Sub module not found: ${referencedModule} ... ${path}`);
                            }
                            const subModule = _.get(referencedModule, path);
                            if (options.factory == 'function') {
                                if (!_.isFunction(subModule)) {
                                    return Promise.reject(`Sub module is not a function (factory expected): ${referencedModule} ... ${path}`);
                                }
                                return subModule(...resolvedArgs);
                            } else {
                                return subModule;
                            }
                        });
                        resolver.resolve(instance);
                    });
            }
        }
    };
};

