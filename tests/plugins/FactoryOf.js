const Promise = require('bluebird');
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
        awareRef: {
            literal: 'aware-ref'
        },
        awareRef2: {
            literal: 'aware-ref-2'
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
    it('should factorize es6 classes and apply awares', function() {
        //noinspection JSUnresolvedVariable
        return Promise.all([
            wireFactoryOf(TEST_VALUE)
                .should.eventually.have.deep.property('factoryOfHash.value', TEST_VALUE),
            wireFactoryOf(TEST_VALUE)
                .should.eventually.have.property('awareRef', 'aware-ref'),
            wireFactoryOf(TEST_VALUE)
                .should.eventually.have.property('awareRef2', 'aware-ref-2'),
        ]);

    });
});
