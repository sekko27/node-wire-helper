const PREFIX = '[WIRE-CONTEXT-HELPER]';

class DummyLoaderLogger {
    //noinspection JSMethodCanBeStatic
    warn(...args) {
        console.warn(PREFIX, ...args);
    }

    //noinspection JSUnusedGlobalSymbols
    warning(...args) {
        this.warn(...args);
    }

    //noinspection JSMethodCanBeStatic
    info(...args) {
        console.info(PREFIX, ...args);
    }

    debug(...args) {
        this.info(...args);
    }

    //noinspection JSMethodCanBeStatic
    err(...args) {
        console.error(PREFIX, ...args);
    }

    //noinspection JSUnusedGlobalSymbols
    error(...args) {
        this.err(...args);
    }
}

module.exports = DummyLoaderLogger;
