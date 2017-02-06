const _ = require('lodash');
const fs = require('fs');
const Promise = require('bluebird');

class Utils {
    static fileExists(path) {
        return Promise.fromCallback((callback) => {
                fs.stat(path, callback);
            })
            .then((fileStat) => {
                return fileStat.isFile() ? Promise.resolve(fileStat) : Promise.reject();
            });

    }

    static ensureArray(value) {
        return _.isArray(value) ? value : [value];
    }

    static addToArrayProperty(base, property, element) {
        if (_.has(base, property) && _.isArray(base[property])) {
            base[property].push(element);
        } else {
            base[property] = [element];
        }
    }
}

module.exports = Utils;
