const _ = require('lodash');
const pathModule = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();

const Promise = require('bluebird');
const CoCModuleLoader = require('./../../lib/loader/CoCModuleLoader');

function buildWarningLoader(resolve) {
    const logger = {warn: resolve};
    return new CoCModuleLoader({logger: logger});
}

//noinspection NodeModulesDependencies
describe('CoCModuleLoader', function() {
    //noinspection NodeModulesDependencies
    it('should not emit warning registering module root with existing package.json', function(done) {
        //noinspection JSUnresolvedFunction
        new Promise((resolve, reject) => {
            buildWarningLoader(resolve).registerModuleRoot(pathModule.join(__dirname, '../..'))
                .then(() => {
                    reject(new Error("registered without warnings"));
                })
        }).timeout(100).should.be.rejectedWith(Error, "registered without warnings").and.notify(done);
    });

    //noinspection NodeModulesDependencies
    it('should load domain model', function(done) {
        //noinspection JSUnresolvedVariable
        new Promise((resolve, reject) => {
            const logger = {warn: reject};
            new CoCModuleLoader({logger: logger}).registerModuleRoot(pathModule.join(__dirname, "module-one"))
                .then((loader) => {
                    return loader.load('lib#model:A');
                })
                .then(resolve);
        }).should.become("module-one-A-model").and.notify(done);
    });

    //noinspection NodeModulesDependencies
    it('should load module with priority (priority is low) and emit info log about more than 1 matching path exist', function(done) {
        const loader = new CoCModuleLoader({
            logger: {
                info: function() {}
            }
        });
        Promise.all([
                loader.registerModuleRoot(pathModule.join(__dirname, 'module-one'), 1),
                loader.registerModuleRoot(pathModule.join(__dirname, 'module-two'), 0)
            ])
            .then(() => {
                return loader.load('lib#model:A');
            }).should.become('module-two-A-model').and.notify(done);
    });

    _.forEach(
        [
            ['lib#domain:A', 'module-one-A-domain'],
            ['lib#model:A', 'module-one-A-model'],
            ['lib#Model:A', 'module-one-AModel-model'],
            ['lib#service:A', 'module-one-A-service'],
            ['lib#Service:A', 'module-one-AService-service'],
            ['lib#infrastructure:A', 'module-one-A-infrastructure'],
            ['lib#repository:A', 'module-one-A-repository'],
            ['lib#Repository:A', 'module-one-ARepository-repository'],
            ['lib#web:A', 'module-one-A-web'],
            ['lib#application:A', 'module-one-A-web'],
            ['lib#applicationMiddleware:A', 'module-one-A-applicationMiddleware'],
            ['lib#ApplicationMiddleware:A', 'module-one-AApplicationMiddleware-applicationMiddleware'],
            ['lib#applicationConfigurator:A', 'module-one-A-applicationConfigurator'],
            ['lib#ApplicationConfigurator:A', 'module-one-AApplicationConfigurator-applicationConfigurator'],
            ['lib#applicationFactory:A', 'module-one-A-applicationFactory'],
            ['lib#ApplicationFactory:A', 'module-one-AApplicationFactory-applicationFactory'],
            ['lib#persistence:A', 'module-one-A-persistence'],
            ['lib#messaging:A', 'module-one-A-messaging'],
            ['lib#log:A', 'module-one-A-log'],
            ['lib#i18n:A', 'module-one-A-i18n'],
            ['lib#cli:A', 'module-one-A-cli'],
            ['lib#command:A', 'module-one-A-command'],
            ['lib#Command:A', 'module-one-ACommand-command'],
            ['lib#util:A', 'module-one-A-util'],
            ['lib#context:A', 'module-one-A-context'],
        ], ([pathSpec, expected]) => {
            it(`should resolve ${pathSpec} to ${expected}`, (done) => {
                new CoCModuleLoader().registerModuleRoot(pathModule.join(__dirname, 'module-one'))
                    .then((loader) => {
                        return loader.load(pathSpec);
                    }).should.become(expected).and.notify(done);
            })
        });
});

