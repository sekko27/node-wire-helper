const _ = require('lodash');

class Helper {
    static isSecret(key) {
        const normalized = String(key).toLowerCase();
        return /secret/.test(normalized)
            || /token/.test(normalized)
            || /api_key/.test(normalized)
            || /apikey/.test(normalized)
    }

    static ref(name) {
        return {$ref: name};
    }

    //noinspection JSUnusedGlobalSymbols
    static refs(names) {
        return _.map(names, Helper.ref);
    }

    static environment() {
        return process.env['NODE_ENV'] || 'production';
    }

    static env(cases) {
        const env = Helper.environment();
        return _.result(cases, _.has(cases, env) ? env : 'default');
    }

    static displayValue(name, value, forceHide) {
        return (Helper.isSecret(name) || forceHide) ? '[HIDDEN]' : value;
    }
    //noinspection JSUnusedGlobalSymbols
    static envVar(name, def, forceHide = false) {
        if (process.env[name]) {
            const value = process.env[name];
            const displayValue = Helper.displayValue(name, value, forceHide);
            console.log(`Using ${name} environment variable: ${displayValue}`);
            return value;
        } else {
            const displayValue = Helper.displayValue(name, def, forceHide);
            console.log(`Using default value for ${name} environment variable: ${displayValue}`);
            return def;
        }
    }

    static envInteger(name, def = 0) {
        const value = parseInt(Helper.envVar(name, def));
        return isNaN(value) ? def : value;
    }

    static envNumber(name, def = 0.0) {
        const value = parseFloat(Helper.envVar(name, def));
        return isNaN(value) ? def : value;
    }

    static toBoolean(value) {
        return _.indexOf(['true', 't', '1', 'yes', 'y'], value) > -1;
    }
    static envBoolean(name, def = false) {
        return Helper.toBoolean(String(Helper.envVar(name, def)).toLowerCase());
    }

    static envList(name, delimiter = ',', def = []) {
        return _.chain(String(Helper.envVar(name, def.join(delimiter))).split(delimiter))
            .map(_.trim)
            .value();
    }

    static envIntegerList(name, delimiter = ',', def = []) {
        const list = _.chain(Helper.envList(name, delimiter, def)).map((value) => parseInt(value)).value();
        const nanElement = _.find(list, _.isNaN);
        if (_.isUndefined(nanElement)) {
            return list;
        }
        throw new TypeError(`Integer environment variable contains non-integer element: ${name}`);
    }

    static envNumberList(name, delimiter = ',', def = []) {
        const list = _.chain(Helper.envList(name, delimiter, def)).map((value) => parseFloat(value)).value();
        const nanElement = _.find(list, _.isNaN);
        if (_.isUndefined(nanElement)) {
            return list;
        }
        throw new TypeError(`Number environment variable contains non-numeric element: ${name}`);

    }
    static prepareArg(arg) {
        if (_.isString(arg)) {
            const match = arg.match(/^=>(.+)$/);
            return match ? Helper.ref(match[1].trim()) : arg;
        }
        return arg;
    }

    static prepareArgs(args) {
        return _.map(args, Helper.prepareArg);
    }

    static create(module, args, properties = undefined) {
        return {
            create: {
                module: module,
                args: Helper.prepareArgs(args)
            },
            properties: properties
        };
    }

    static factory(module, ...argSpec) {
        return Helper.create(module, argSpec);
    }

    //noinspection JSUnusedGlobalSymbols
    static subFactory(module, ...argSpec) {
        return {
            sub: {
                factory: 'function',
                module: module,
                args: Helper.prepareArgs(argSpec)
            }
        };
    }

    static subFactoryOf(module, ...argsSpec) {
        return {
            sub: {
                factory: 'factoryOf',
                module: module,
                args: Helper.prepareArgs(argsSpec)
            }
        };
    }

    static subFactoryOfFactory(module, ...argsSpec) {
        return {
            sub: {
                factory: 'factoryOfFactory',
                module: module,
                args: Helper.prepareArgs(argsSpec)
            }
        };
    }

    //noinspection JSUnusedGlobalSymbols
    static subModule(module) {
        return {
            sub: {
                factory: 'module',
                module: module
            }
        }
    }

    static factoryOf(module, ...argsSpec) {
        return {
            factoryOf: {
                module: module,
                args: Helper.prepareArgs(argsSpec)
            }
        };
    }

    static factoryOfFactory(module, ...argsSpec) {
        return {
            factoryOfFactory: {
                module: module,
                args: Helper.prepareArgs(argsSpec)
            }
        };
    }
}

module.exports = Helper;
