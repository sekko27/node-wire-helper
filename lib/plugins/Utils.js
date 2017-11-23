const _ = require('lodash');
const colors = require('colors');
const Aware = require('./Aware');

const Utils = {
    getPromise: function(wire) {
        return wire({$ref: 'Promise'})
            .catch(() => {
                return require('bluebird');
            });
    },
    getLogger: function(wire) {
        const loggerFactory = (color) => (message, ...args) =>
            console.log(`↳ [${colors[color].bold('Wire-Context-Helper')}]: ${message}`, ...args);

        return wire({$ref: 'logger'})
            .catch(() => {
                return {
                    info: loggerFactory('green'),
                    debug: loggerFactory('gray'),
                    error: loggerFactory('red'),
                    warn: loggerFactory('orange'),
                    notice: loggerFactory('yellow')
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
    extractSpec(spec, Promise) {
        if (_.isObject(spec)) {
            return Promise.resolve(spec);
        } else if (_.isString(spec)) {
            return Promise.resolve({prop: spec, ref: spec});
        } else {
            return Promise.reject(`Invalid type of aware spec`);
        }
    },
    resolveAware(component, wire, spec, Promise) {
        return Utils.extractSpec(spec, Promise).then(({prop, ref}) => Utils.assignAware(component, wire, prop, ref));
    },
    awareReferenceKeys(interestedFor, Promise) {
        return Promise.mapSeries(interestedFor, (spec) => Utils.extractSpec(spec, Promise).then(({prop, ref}) => `${prop}=@${ref}`));
    },
    applyAwares: function(wire, component, Promise, logger) {
        if (Utils.isAwareness(component)) {
            const interestedFor = component.$awareOf();
            if (!_.isArray(interestedFor)) {
                logger.warn(`[WIRE-AWARE] - Component "${component.constructor.name}" interesting should be an array contains {prop, ref} or prop or function`);
                return Promise.resolve(component);
            }

            return Utils.awareReferenceKeys(interestedFor, Promise)
                .then((keys) => {
                    logger.info(`[WIRE-AWARE] - Component "${component.constructor.name}" is awareness: ${keys.join(',')}`);
                    return Promise.each(interestedFor, (spec) => {
                        return Utils.resolveAware(component, wire, spec, Promise);
                    });
                })
                .then(() => component);
        } else {
            return Promise.resolve(component);
        }
    }
};

module.exports = Utils;
