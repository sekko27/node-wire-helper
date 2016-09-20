_ = require 'lodash'
chai = require 'chai'
chaiAsPromised = require 'chai-as-promised'
chai.use chaiAsPromised
chai.should()
Promise = require 'bluebird'
CoCModuleLoader = require './../../lib/loader/CoCModuleLoader'
pathModule = require 'path'

buildWarningLoader = (resolve) ->
  logger = warn: resolve
  loader = new CoCModuleLoader()
  loader.logger = logger
  loader

describe 'CoCModuleLoader', ->
  it 'should emit warning registering module root without package.json', ->
    new Promise(
      (resolve) ->
        loader = buildWarningLoader(resolve)
        loader.registerModuleRoot(__dirname)
    ).should.become "No package.json found in module root: #{__dirname}"

  it 'should not emit warning registering module root with existing package.json', ->
    new Promise(
      (resolve, reject) ->
        loader = buildWarningLoader(resolve)
        loader.registerModuleRoot(pathModule.join(__dirname, '../..')).then ->
          reject(new Error("registered without warnings"))
    ).timeout(100).should.be.rejectedWith Error, "registered without warnings"

  it 'should load domain model', ->
    new Promise(
      (resolve, reject) ->
        logger = warn: reject
        loader = new CoCModuleLoader()
        loader.logger = logger
        loader.registerModuleRoot(pathModule.join(__dirname, "module-one"))
          .then ->
            loader.load('lib#model:A')
          .then resolve
    ).should.become "module-one-A-model"

  it 'should load module with priority (priority is low) and emit info log about more than 1 matching path exist', ->
    new Promise(
      (resolve, reject) ->
        logResolve = null
        logPromise = new Promise (res) ->
          logResolve = res
        logger = warn: reject, info: (msg) -> logResolve(msg)
        loader = new CoCModuleLoader()
        loader.logger = logger
        loadPromise = Promise.all([
          loader.registerModuleRoot(pathModule.join(__dirname, "module-one"), 1)
          loader.registerModuleRoot(pathModule.join(__dirname, "module-two"), 0)
        ])
          .then -> loader.load('lib#model:A')
        Promise.all([logPromise, loadPromise]).then resolve
    ).should.become [
      'More than one (2) valid roots have been found for lib/domain/models/A (choosing the first): /development/node-wire-helper/tests/loader/module-two,/development/node-wire-helper/tests/loader/module-one'
      'module-two-A-model'
    ]

  _.forEach [
    ['lib#domain:A', 'module-one-A-domain']
    ['lib#model:A', 'module-one-A-model']
    ['lib#Model:A', 'module-one-AModel-model']
    ['lib#service:A', 'module-one-A-service']
    ['lib#Service:A', 'module-one-AService-service']
    ['lib#infrastructure:A', 'module-one-A-infrastructure']
    ['lib#repository:A', 'module-one-A-repository']
    ['lib#Repository:A', 'module-one-ARepository-repository']
    ['lib#web:A', 'module-one-A-web']
    ['lib#application:A', 'module-one-A-web']
    ['lib#applicationMiddleware:A', 'module-one-A-applicationMiddleware']
    ['lib#ApplicationMiddleware:A', 'module-one-AApplicationMiddleware-applicationMiddleware']
    ['lib#applicationConfigurator:A', 'module-one-A-applicationConfigurator']
    ['lib#ApplicationConfigurator:A', 'module-one-AApplicationConfigurator-applicationConfigurator']
    ['lib#applicationFactory:A', 'module-one-A-applicationFactory']
    ['lib#ApplicationFactory:A', 'module-one-AApplicationFactory-applicationFactory']
    ['lib#persistence:A', 'module-one-A-persistence']
    ['lib#messaging:A', 'module-one-A-messaging']
    ['lib#log:A', 'module-one-A-log']
    ['lib#i18n:A', 'module-one-A-i18n']
    ['lib#cli:A', 'module-one-A-cli']
    ['lib#command:A', 'module-one-A-command']
    ['lib#Command:A', 'module-one-ACommand-command']
    ['lib#util:A', 'module-one-A-util']
    ['lib#context:A', 'module-one-A-context']
    #['lib#view:A', 'module-one-A-view']
    #['lib#View:A', 'module-one-AView-view']
  ], ([pathSpec, expected]) ->
    it "should resolve #{pathSpec} to #{expected}", ->
      new Promise( (resolve, reject) ->
        loader = new CoCModuleLoader()
        loader.logger = warn: reject, info: ->
        loader.registerModuleRoot pathModule.join(__dirname, "module-one")
          .then -> loader.load(pathSpec)
          .then resolve
      ).should.become expected