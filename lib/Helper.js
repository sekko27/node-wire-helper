const _ = require('lodash');

class Helper {
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

    //noinspection JSUnusedGlobalSymbols
    static envVar(name, def) {
        if (process.env[name]) {
            const value = process.env[name];
            console.log(`Using ${name} environment variable: ${value}`);
            return value;
        } else {
            console.log(`Using default value for ${name} environment variable: ${def}`);
            return def;
        }
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
