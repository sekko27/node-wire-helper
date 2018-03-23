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
        awareSource: {
            literal: 'aware-source'
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
    it('should apply awareness rules - factory', function(done) {
        wireSubHash('c', 'factoryOf').should.eventually.have.deep.property('prop.awareSource', 'aware-source').and.notify(done);
    });
    it('should apply awareness rules - factoryOfFactory', function(done) {
        wireSubHash('c', 'factoryOfFactory').then(ctx => ctx.prop()).should.eventually.have.property('awareSource', 'aware-source').and.notify(done);
    });

});
