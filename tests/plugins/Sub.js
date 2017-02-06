const _ = require('lodash');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();
const CoCModuleLoader = require('./../../lib/loader/CoCModuleLoader');
const wire = require('wire');

function wireSubHash(prop, factory) {
    const contextSpec = {
        $plugins: [
            {
                module: `${__dirname}/../../lib/plugins/Sub`
            }
        ],
        Promise2: {
            module: 'bluebird'
        },
        hash: {
            module: 'lib#model:SubHash'
        },
        prop: {
            sub: {
                module: `hash#${prop}`,
                factory: factory
            }
        }
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

describe('Sub plugin', function() {
    it('should extract property from bean', function(done) {
        wireSubHash('a', 'module').should.eventually.have.property('prop', 1).and.notify(done);
    });
});
