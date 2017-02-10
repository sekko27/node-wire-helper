const Utils = {
    getPromise: function(wire) {
        return wire({$ref: 'Promise'})
            .catch(() => {
                return require('bluebird');
            });
    }
};

module.exports = Utils;
