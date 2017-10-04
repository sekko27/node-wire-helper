const _ = require('lodash');
const Aware = require('./Aware');

const Utils = {
    getPromise: function(wire) {
        return wire({$ref: 'Promise'})
            .catch(() => {
                return require('bluebird');
            });
    },
    getLogger: function(wire) {
        return wire({$ref: 'logger'})
            .catch(() => {
                return {
                    info: console.log,
                    debug: console.log,
                    error: console.error,
                    warn: console.log,
                    notice: console.log
                };
            });
    },
    isAwareness(component) {
        if (component instanceof Aware) {
            return true;
        }
        return _.hasIn(component, '$awareOf') && _.isFunction(component.$awareOf);
    },
    assignAware(component, wire, prop, ref) {
        return wire({$ref: ref}).then((resolvedRef) => {
            Object.defineProperty(component, prop, {
                enumerable: false,
                configurable: false,
                writable: false,
                value: resolvedRef
            });
            return component;
        });
    },
    resolveAware(component, wire, spec, Promise) {
        if (_.isObject(spec)) {
            const {prop, ref} = spec;
            return Utils.assignAware(component, wire, prop, ref);
        } else if (_.isString(spec)) {
            return Utils.assignAware(component, wire, spec, spec);
        } else {
            return Promise.reject(`Invalid type of aware spec`);
        }
    },
    applyAwares: function(wire, component, Promise, logger) {
        if (Utils.isAwareness(component)) {
            const interestedFor = component.$awareOf();
            if (!_.isArray(interestedFor)) {
                logger.warn(`[WIRE-AWARE] - Component "${component.constructor.name}" interesting should be an array contains {prop, ref} or prop or function`);
                return Promise.resolve(component);
            }

            logger.debug(`[WIRE-AWARE] - Component "${component.constructor.name}" is awareness`);
            return Promise.each(interestedFor, (spec) => {
                return Utils.resolveAware(component, wire, spec, Promise);
            }).then(() => component);
        } else {
            return Promise.resolve(component);
        }
    }
};

module.exports = Utils;
