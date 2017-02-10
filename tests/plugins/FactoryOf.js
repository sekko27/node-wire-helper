const _ = require('lodash');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();
const CoCModuleLoader = require('./../../lib/loader/CoCModuleLoader');
const wire = require('wire');

const TEST_VALUE = 'test-value-of-factory-of';
function wireFactoryOf(value) {
    const contextSpec = {
        $plugins: [
            {
                module: `${__dirname}/../../lib/plugins/FactoryOf`
            }
        ],
        Promise2: {
            module: 'bluebird'
        },
        factoryOfHash: {
            factoryOf: {
                module: 'lib#model:FactoryOf',
                args: [
                    value
                ]
            }
        },
    };
    return new CoCModuleLoader().registerModuleRoot(`${__dirname}/../loader/module-one`)
        .then((loader) => {
            return wire(contextSpec, {
                require: function(m) {
                    return loader.load(m);
                }
            });
        });
}

describe('FactoryOf plugin', function() {
    it('should factorize es6 classes', function(done) {
        //noinspection JSUnresolvedVariable
        wireFactoryOf(TEST_VALUE).should.eventually.have
            .deep.property('factoryOfHash.value', TEST_VALUE).and.notify(done);
    });
});
