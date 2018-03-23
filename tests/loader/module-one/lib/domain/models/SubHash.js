const {Aware} = require.main.require('index');

module.exports = {
    a: 1,
    b: function () {
        return 2;
    },
    c: class C extends Aware {
        $awareOf() {
            return ['awareSource'];
        }
    }
};